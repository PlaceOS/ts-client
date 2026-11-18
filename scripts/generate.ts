/**
 * Generates the client code from the OpenAPI documents of the PlaceOS APIs: `src/generated` from
 * PlaceOS/rest-api, and `src/generated/staff` from PlaceOS/staff-api. It downloads each document
 * from the master branch on each run, so the output follows the APIs.
 *
 *     bun run generate                  Writes the generated files.
 *     bun scripts/generate.ts --check   Fails if a generated file is not up to date.
 *
 * The output is one schema file and one operation file for each API controller. The schema file
 * has a schema value and a type of the same name for each named schema that an operation uses,
 * directly or through other schemas. Each operation file has one function for each endpoint of
 * the controller.
 *
 * The generator stops with an assertion on a part of the document that it does not support. Then
 * a change to the document cannot make the output wrong without a message.
 */
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { format, resolveConfig } from 'prettier';
import { assert } from '../src/core/assert.ts';
import { isRecord } from '../src/core/schema.ts';
import { ANIMATIONS } from './value-enums.ts';

const ROOT = join(import.meta.dir, '..');
const SPEC_TIMEOUT_MS = 30_000;
const SPEC_BYTES_MAX = 16 * 1024 * 1024;
const EMIT_DEPTH_MAX = 32;
const LINE_WIDTH_MAX = 100;

/**
 * The `Time` fields that the server sends and accepts as Unix time in seconds, by schema. Each
 * entry comes from the source of PlaceOS/models, PlaceOS/staff-api and PlaceOS/calendar. These
 * fields get the note "Unix time in seconds.", because `integer` does not give the unit.
 *
 * The spec generator of the server lost the `type: "integer"` hint of a `Time` field that has an
 * epoch converter, if the field is a PgORM `attribute` or can be nil. The document then says
 * `date-time`. PlaceOS/rest-api#469 fixed the generator, so the rest-api document says `integer`.
 * The staff-api document is not regenerated yet, so its `date-time` is patched to `integer`. See
 * `ApiSource.epoch_patch`.
 */
const TIMESTAMPS = ['created_at', 'updated_at'];
const SECONDS_FIELDS: ReadonlyMap<string, readonly string[]> = new Map([
    ['PlaceOS.Api.ApiKeys.Response', ['expires_at']],
    ['PlaceOS.Model.Alert', TIMESTAMPS],
    ['PlaceOS.Model.AlertDashboard', TIMESTAMPS],
    ['PlaceOS.Model.ApiKey', [...TIMESTAMPS, 'expires_at']],
    ['PlaceOS.Model.Asset', TIMESTAMPS],
    ['PlaceOS.Model.AssetCategory', TIMESTAMPS],
    ['PlaceOS.Model.AssetPurchaseOrder', TIMESTAMPS],
    ['PlaceOS.Model.AssetType', TIMESTAMPS],
    ['PlaceOS.Model.Authority', TIMESTAMPS],
    ['PlaceOS.Model.Broker', TIMESTAMPS],
    ['PlaceOS.Model.Chat', TIMESTAMPS],
    ['PlaceOS.Model.ControlSystem', [...TIMESTAMPS, 'signage_last_seen']],
    ['PlaceOS.Model.DoorkeeperApplication', TIMESTAMPS],
    ['PlaceOS.Model.Driver', TIMESTAMPS],
    ['PlaceOS.Model.Edge', [...TIMESTAMPS, 'last_seen']],
    ['PlaceOS.Model.Edge.KeyResponse', [...TIMESTAMPS, 'last_seen']],
    ['PlaceOS.Model.History', ['created_at']],
    ['PlaceOS.Model.JsonSchema', TIMESTAMPS],
    ['PlaceOS.Model.LdapAuthentication', TIMESTAMPS],
    ['PlaceOS.Model.Module', [...TIMESTAMPS, 'error_timestamp']],
    ['PlaceOS.Model.OAuthAuthentication', TIMESTAMPS],
    ['PlaceOS.Model.Playlist', TIMESTAMPS],
    ['PlaceOS.Model.Playlist.Item', TIMESTAMPS],
    ['PlaceOS.Model.Playlist.ItemSchedule', TIMESTAMPS],
    ['PlaceOS.Model.Playlist.Revision', TIMESTAMPS],
    ['PlaceOS.Model.Repository', TIMESTAMPS],
    ['PlaceOS.Model.SamlAuthentication', TIMESTAMPS],
    ['PlaceOS.Model.Settings', TIMESTAMPS],
    ['PlaceOS.Model.Shortener', [...TIMESTAMPS, 'valid_from', 'valid_until']],
    ['PlaceOS.Model.SignagePlugin', TIMESTAMPS],
    ['PlaceOS.Model.Storage', TIMESTAMPS],
    ['PlaceOS.Model.Trigger', TIMESTAMPS],
    ['PlaceOS.Model.Trigger.Conditions.TimeDependent', ['time']],
    ['PlaceOS.Model.TriggerInstance', TIMESTAMPS],
    ['PlaceOS.Model.Upload', TIMESTAMPS],
    ['PlaceOS.Model.User.AdminMetadataResponse', ['created_at', 'last_login']],
    ['PlaceOS.Model.User.AdminResponse', ['created_at', 'last_login']],
    ['PlaceOS.Model.User.PublicMetadataResponse', ['created_at', 'last_login']],
    // The staff API. Its models are `ModelWithAutoKey`, which has the epoch `Timestamps`.
    ['PlaceOS.Model.Attendee', TIMESTAMPS],
    ['PlaceOS.Model.Booking', TIMESTAMPS],
    ['PlaceOS.Model.EventMetadata', TIMESTAMPS],
    ['PlaceOS.Model.Guest', TIMESTAMPS],
    ['PlaceOS.Model.Survey', TIMESTAMPS],
    ['PlaceOS.Model.Survey.Answer', TIMESTAMPS],
    ['PlaceOS.Model.Survey.Invitation', TIMESTAMPS],
    ['PlaceOS.Model.Survey.Question', TIMESTAMPS],
    // PlaceOS/calendar: `Time::EpochConverter` on a `Time?`.
    ['PlaceCalendar.Event', ['event_end']],
    ['PlaceOS.Model.User.PublicResponse', ['created_at', 'last_login']],
    ['PlaceOS.Model.Zone', TIMESTAMPS],
]);

/**
 * The `date-time` fields that really are RFC 3339 strings: models with `PgORM::Timestamps`, and
 * `Time` fields without a converter. Each `date-time` field of a named schema must be in this list
 * or in `SECONDS_FIELDS`, so that a new field gets a decision.
 */
const STRING_TIME_FIELDS: ReadonlyMap<string, readonly string[]> = new Map([
    ['PlaceOS.Api.BuildMonitor.TaskStatus', ['timestamp']],
    ['PlaceOS.Api.ChatGPT.Plugin.Details', ['current_time']],
    ['PlaceOS.Api.Groups.Invitations.InvitationCreatePayload', ['expires_at']],
    ['PlaceOS.Api.MicrosoftNotification.ChangeNotification', ['subscriptionExpirationDateTime']],
    ['PlaceOS.Api.Root.SourceResyncStatus', ['started_at', 'finished_at']],
    ['PlaceOS.Api.Uploads.UploadInfo', ['cache_modified']],
    ['PlaceOS.Model.Group', TIMESTAMPS],
    ['PlaceOS.Model.GroupInvitation', [...TIMESTAMPS, 'expires_at']],
    ['PlaceOS.Model.GroupUser', TIMESTAMPS],
    ['PlaceOS.Model.GroupZone', TIMESTAMPS],
    ['PlaceOS.Model.PendingMail', [...TIMESTAMPS, 'send_at', 'expiry', 'sent_at', 'rejected_at']],
    ['PlaceOS.Model.SignageTemplate', TIMESTAMPS],
    ['PlaceOS.Model.SignageTemplate.SystemTemplate', TIMESTAMPS],
    ['PlaceOS.Model.Upload', ['cache_modified']],
    // The staff API. PlaceOS/calendar and PlaceOS/office365 have no converter on these.
    ['PlaceCalendar.Event', ['created', 'updated']],
    [
        'Office365.ChatMessage',
        ['createdDateTime', 'deletedDateTime', 'lastModifiedDateTime', 'lastEditedDateTime'],
    ],
    ['Office365.ChatMessageHistoryItem', ['modifiedDateTime']],
]);

/**
 * Enum fields that the server sends as the number of the enum. A PgORM `attribute` with
 * `Enum::ValueConverter` writes `value`, but the document gives the names of the enum. The values
 * come from PlaceOS/models, and the live server sends these numbers. `ApiKey.permissions` has the
 * same converter in the models source, but the server sends its name, so it is not here.
 */
const DRIVER_ROLES = { ssh: 0, device: 1, service: 2, websocket: 3, logic: 99 };
const VALUE_ENUM_FIELDS: ReadonlyMap<string, Readonly<Record<string, ValueEnum>>> = new Map([
    [
        'PlaceOS.Model.Broker',
        {
            auth_type: valueEnum('PlaceOS.Model.Broker.AuthType', {
                certificate: 0,
                no_auth: 1,
                user_password: 2,
            }),
        },
    ],
    ['PlaceOS.Model.Driver', { role: valueEnum('PlaceOS.Model.Driver.Role', DRIVER_ROLES) }],
    ['PlaceOS.Model.Module', { role: valueEnum('PlaceOS.Model.Driver.Role', DRIVER_ROLES) }],
    [
        'PlaceOS.Model.Playlist',
        { default_animation: valueEnum('PlaceOS.Model.Playlist.Animation', ANIMATIONS) },
    ],
    [
        'PlaceOS.Model.Playlist.Item',
        { animation: valueEnum('PlaceOS.Model.Playlist.Animation', ANIMATIONS) },
    ],
    [
        'PlaceOS.Model.Settings',
        {
            encryption_level: valueEnum('PlaceOS.Encryption.Level', {
                none: 0,
                support: 1,
                admin: 2,
                never_display: 3,
            }),
        },
    ],
]);

interface ValueEnum {
    /** The enum schema of the document that the field refers to now. */
    readonly spec_name: string;
    readonly values: Readonly<Record<string, number>>;
}

function valueEnum(spec_name: string, values: Readonly<Record<string, number>>): ValueEnum {
    return { spec_name, values };
}

/**
 * Fields that the document gives as `type: object` without properties, because the spec
 * generator of the server does not know their Crystal type. The server sends a string:
 * `Time::Location` as its name, `URI` as text, `UserJWT::Scope` as its name, and `JSON::Any` with
 * `StringConverter` as JSON text. `string` replaces the object, and `array` replaces the object
 * items of an array. Each entry comes from the source of PlaceOS/models and PlaceOS/rest-api.
 */
const STRING_FIELDS: ReadonlyMap<string, Readonly<Record<string, 'string' | 'array'>>> = new Map([
    ['PlaceOS.Api.ApiKeys.Response', { scopes: 'array' }],
    ['PlaceOS.Api.Cluster.NodeStatus', { uri: 'string' }],
    ['PlaceOS.Model.ApiKey', { scopes: 'array' }],
    ['PlaceOS.Model.ControlSystem', { timezone: 'string' }],
    ['PlaceOS.Model.Driver', { json_schema: 'string' }],
    ['PlaceOS.Model.UserJWT', { scope: 'array' }],
    ['PlaceOS.Model.Zone', { timezone: 'string' }],
]);

/**
 * Fields that the server sends, but the document does not have. The spec generator of the server
 * leaves out the fields that a request cannot set: an attribute with `ignore_deserialize`, and a
 * getter with a `JSON::Field`. Each field is a schema of the document, from the source of
 * PlaceOS/models. It is optional, so it is `null` when the server does not send it. The fields
 * that refer to their own schema, such as `Booking.linked_bookings`, are not here, because the
 * schemas cannot have a cycle.
 */
const ASSET_COUNT = {
    type: 'integer',
    format: 'Int64',
    description: 'The number of assets of this type.',
};
const METADATA = {
    type: 'object',
    additionalProperties: { $ref: '#/components/schemas/PlaceOS.Model.Metadata.Interface' },
    description: 'The metadata of the user, by name.',
};
const ADDED_FIELDS: ReadonlyMap<string, Readonly<Record<string, SpecNode>>> = new Map([
    ['PlaceOS.Model.AssetType', { asset_count: ASSET_COUNT }],
    [
        'PlaceOS.Model.Booking',
        {
            booked_by_id: { type: 'string' },
            email_digest: { type: 'string', description: 'The digest of `user_email`.' },
            booked_by_email_digest: {
                type: 'string',
                description: 'The digest of `booked_by_email`.',
            },
            created: { type: 'integer', format: 'Int64', description: 'Unix time in seconds.' },
            current_state: { $ref: '#/components/schemas/PlaceOS.Model.Booking.State' },
        },
    ],
    [
        'PlaceOS.Model.Guest',
        {
            checked_in: { type: 'boolean' },
            visit_expected: { type: 'boolean' },
            booking: { $ref: '#/components/schemas/PlaceOS.Model.Booking' },
            event: { $ref: '#/components/schemas/PlaceCalendar.Event' },
            event_metadata: { description: 'The metadata of the event, as JSON.' },
        },
    ],
    ['PlaceOS.Model.User.AdminMetadataResponse', { associated_metadata: METADATA }],
    ['PlaceOS.Model.User.PublicMetadataResponse', { associated_metadata: METADATA }],
]);

/** Operations that send JSON, but have no response schema in the document. */
const JSON_RESPONSE_OPERATIONS: ReadonlySet<string> = new Set([
    'PlaceOS::Api::Modules_execute',
    'PlaceOS::Api::Modules_state_value',
    'PlaceOS::Api::Systems_execute',
]);

/**
 * Short names for schemas with a name from the server code that does not say what they are. The
 * app name is an alias: `User` and `UserAdminMetadataResponse` are the same value and type.
 */
const TYPE_ALIASES: ReadonlyMap<string, string> = new Map([
    ['UserAdminMetadataResponse', 'User'],
    ['ControlSystem', 'System'],
    ['DoorkeeperApplication', 'Application'],
    ['Authority', 'Domain'],
    ['MetadataInterface', 'Metadata'],
    ['Shortener', 'ShortUrl'],
    ['SignageTemplateSystemTemplate', 'SignageTemplateMapping'],
]);

/**
 * Input keys for parameters with a name that the input uses for something else. `body` of the
 * input is the request body, so a query parameter `body` gets another key. The query keeps the
 * name of the document.
 */
const PARAMETER_KEYS: ReadonlyMap<string, Readonly<Record<string, string>>> = new Map([
    // The description of the meeting.
    ['Events_book', { body: 'body_text' }],
]);

/** Names that the core modules export. A generated name must not hide one. */
const CORE_NAMES: ReadonlySet<string> = new Set([
    'AnyOperation',
    'AnySchema',
    'Auth',
    'AuthEnvironment',
    'AuthError',
    'AuthSession',
    'AuthSessionConfig',
    'AuthStatus',
    'BindingState',
    'Credential',
    'DebugMessage',
    'DebugTarget',
    'DomainAuthority',
    'DomainAuthorityInput',
    'FrameError',
    'Grant',
    'KeyValueStore',
    'CallError',
    'CallOptions',
    'CallResult',
    'Client',
    'ClientConfig',
    'FetchFunction',
    'HttpMethod',
    'Input',
    'IntegerFormat',
    'JsonValue',
    'ObjectField',
    'Operation',
    'OperationData',
    'OperationInput',
    'Output',
    'PageInfo',
    'Realtime',
    'RealtimeConfig',
    'RealtimeEnvironment',
    'RealtimeError',
    'RealtimeSocket',
    'RealtimeStatus',
    'RealtimeTarget',
    'Reply',
    'Result',
    'Schema',
    'SchemaError',
    'SchemaNode',
    'SocketHandlers',
    'Simplify',
    'TokenTransport',
]);

const RESERVED_WORDS: ReadonlySet<string> = new Set(
    (
        'break case catch class const continue debugger default delete do else enum export ' +
        'extends false finally for function if import in instanceof new null return super ' +
        'switch this throw true try typeof var void while with yield let static implements ' +
        'interface package private protected public await'
    ).split(' '),
);

/** Schema keys that change nothing in the output. Other keys stop the generator. */
const IGNORED_SCHEMA_KEYS: ReadonlySet<string> = new Set(['description', 'example', 'title']);
/** The schema combinators of `src/core/schema.ts` that the generated code calls. */
const SCHEMA_COMBINATORS = [
    'array',
    'boolean',
    'integer',
    'json',
    'literal',
    'nullable',
    'number',
    'object',
    'record',
    'string',
    'tuple',
    'union',
] as const;
/** The calls of the generated code: the schema combinators and `operation`. */
const PURE_CALL = new RegExp(
    `(?<![\\w.$])(${['operation', 'parameters', ...SCHEMA_COMBINATORS].join('|')})\\(`,
    'g',
);

/** Schema keys that the generator supports. */
const SCHEMA_KEYS: ReadonlySet<string> = new Set([
    '$ref',
    'additionalProperties',
    'anyOf',
    'enum',
    'format',
    'items',
    'maxItems',
    'minItems',
    'prefixItems',
    'properties',
    'required',
    'type',
]);
const METHODS = ['get', 'post', 'put', 'patch', 'delete'] as const;
/** The keys of a path item that are not a method. They change nothing in the output. */
const PATH_ITEM_KEYS: ReadonlySet<string> = new Set(['summary', 'description']);
const INTEGER_FORMATS: ReadonlySet<string> = new Set(['Int32', 'UInt32', 'Int64']);
const NUMBER_FORMATS: ReadonlySet<string> = new Set(['Float32', 'Float64']);
const STRING_FORMATS: ReadonlySet<string> = new Set(['date-time', 'email', 'uuid']);
/** Named schemas that are only an alias of a JSON type. The output puts them inline. */
const INLINE_SCHEMA_NAMES: ReadonlySet<string> = new Set(['Bool', 'JSON.Any', 'String']);

type SpecNode = Readonly<Record<string, unknown>>;

/** One endpoint, ready to write. */
interface OperationPlan {
    readonly operation_id: string;
    readonly controller: string;
    readonly action: string;
    readonly method: (typeof METHODS)[number];
    readonly path: string;
    readonly path_keys: readonly string[];
    readonly summary: string;
    readonly description: string;
    /** Code of the expressions. */
    readonly params: string;
    readonly params_required: boolean;
    readonly body: string | null;
    readonly response: string | null;
    /** Input key to query name, from `PARAMETER_KEYS`. */
    readonly wire_names: Readonly<Record<string, string>>;
    readonly imports: Imports;
}

/** What an expression uses: combinators of the core, and named schemas. */
interface Imports {
    readonly combinators: Set<string>;
    readonly schemas: Set<string>;
}

/** One API and its output. */
interface ApiSource {
    /** The GitHub repository of the server. It has `OPENAPI_DOC.yml` at its root. */
    readonly repository: string;
    readonly dir: string;
    /** The part of each `operationId` before the controller, such as `PlaceOS::Api::`. */
    readonly id_prefix: string;
    /** The part of each operation name before the namespace, such as `staff.`. */
    readonly name_prefix: string;
    /** The path from `dir` to `src/core`. */
    readonly core: string;
    readonly aliases: ReadonlyMap<string, string>;
    /**
     * `true` when the document says `date-time` for the fields of `SECONDS_FIELDS`, and the patch
     * makes them `integer`. `false` when the document says `integer`. The generator stops when the
     * document does not match, so that the flag changes when the document is regenerated.
     */
    readonly epoch_patch: boolean;
}

const APIS: readonly ApiSource[] = [
    {
        repository: 'PlaceOS/rest-api',
        dir: join(ROOT, 'src', 'generated'),
        id_prefix: 'PlaceOS::Api::',
        name_prefix: '',
        core: '../core',
        aliases: TYPE_ALIASES,
        epoch_patch: false,
    },
    {
        repository: 'PlaceOS/staff-api',
        dir: join(ROOT, 'src', 'generated', 'staff'),
        id_prefix: '',
        name_prefix: 'staff.',
        core: '../../core',
        aliases: new Map(),
        epoch_patch: true,
    },
];

await main();

async function main(): Promise<void> {
    const check = process.argv.includes('--check');
    const stale: string[] = [];
    for (const api of APIS) stale.push(...(await generate(api, check)));
    if (check && stale.length > 0) {
        console.error(`Not up to date. Run \`bun run generate\`:\n  ${stale.join('\n  ')}`);
        process.exit(1);
    }
    console.log(check ? 'Up to date.' : `Wrote ${stale.length} files.`);
}

function header(api: ApiSource): string {
    return `// Generated by scripts/generate.ts from the ${api.repository} OpenAPI document. Do not edit.\n`;
}

/** Generates the code of one API. Returns the files that changed, or that would change. */
async function generate(api: ApiSource, check: boolean): Promise<string[]> {
    const operations_dir = join(api.dir, 'operations');
    const spec_text = await downloadSpec(api);
    const spec = asNode(Bun.YAML.parse(spec_text), 'the document');
    assert(asString(field(spec, 'openapi'), 'openapi').startsWith('3.'), 'the document is 3.x');
    const components = asNode(field(spec, 'components'), 'components');
    const schemas = asNode(field(components, 'schemas'), 'components.schemas');
    const paths = asNode(field(spec, 'paths'), 'paths');

    // Read each operation. The emit of its schemas collects the named schemas that it uses.
    const operations: OperationPlan[] = [];
    const skipped: string[] = [];
    for (const [path, item_value] of Object.entries(paths)) {
        const item = asNode(item_value, `paths.${path}`);
        for (const key of Object.keys(item)) {
            const known = PATH_ITEM_KEYS.has(key) || METHODS.some((method) => method === key);
            assert(known, `the key "${key}" of the path ${path} is supported`);
        }
        for (const method of METHODS) {
            const operation_value = field(item, method);
            if (operation_value === undefined) continue;
            const plan = planOperation(api, schemas, path, method, asNode(operation_value, path));
            if (plan === null) {
                skipped.push(`${method.toUpperCase()} ${path}`);
            } else {
                operations.push(plan);
            }
        }
    }

    // The numbered routes of one action, such as PATCH and PUT of an update, become one.
    const kept = mergeRoutes(operations);

    // Emit each named schema that an operation uses, and the schemas that those use.
    const named = new Map<string, { code: string; imports: Imports }>();
    const pending: string[] = [];
    for (const plan of kept) pending.push(...plan.imports.schemas);
    const schema_names = new Map<string, string>();
    const generated_names = new Set<string>();
    for (const spec_name of Object.keys(schemas)) {
        if (!isNamedSchema(spec_name)) continue;
        const name = schemaTypeName(spec_name);
        for (const generated of [name, `${name}Input`, `${name}Schema`]) {
            assert(!generated_names.has(generated), `the schema name ${generated} is unique`);
            assert(!CORE_NAMES.has(generated), `the schema name ${generated} is not a core name`);
            generated_names.add(generated);
        }
        schema_names.set(name, spec_name);
    }
    for (let index = 0; index < pending.length; index += 1) {
        assert(index <= schema_names.size * schema_names.size, 'the schema queue is bounded');
        const name = pending[index] ?? '';
        if (named.has(name)) continue;
        const spec_name = schema_names.get(name);
        assert(spec_name !== undefined, `the schema ${name} exists`);
        const imports: Imports = { combinators: new Set(), schemas: new Set() };
        const node = asNode(field(schemas, spec_name), spec_name);
        const code = emitNamedSchema(api, schemas, spec_name, node, imports);
        named.set(name, { code, imports });
        pending.push(...imports.schemas);
    }

    const files = new Map<string, string>();
    files.set(join(api.dir, 'schemas.ts'), writeSchemasFile(api, named));
    const controllers = new Map<string, OperationPlan[]>();
    for (const plan of kept) {
        const list = controllers.get(plan.controller) ?? [];
        list.push(plan);
        controllers.set(plan.controller, list);
    }
    const namespaces: string[] = [];
    for (const controller of [...controllers.keys()].sort()) {
        const plans = controllers.get(controller) ?? [];
        const file_name = kebabCase(controllerWords(controller));
        files.set(
            join(operations_dir, `${file_name}.ts`),
            writeOperationsFile(api, controller, plans),
        );
        namespaces.push(
            `export * as ${snakeCase(controllerWords(controller))} from './${file_name}.ts';`,
        );
    }
    const index_intro = '/** One namespace for each controller of the API. */';
    files.set(
        join(operations_dir, 'index.ts'),
        `${header(api)}\n${index_intro}\n${namespaces.join('\n')}\n`,
    );

    // Format, then write or compare.
    const config = (await resolveConfig(join(ROOT, 'package.json'))) ?? {};
    const stale: string[] = [];
    for (const [file_path, code] of files) {
        const annotated = markPure(code);
        const formatted = wrapLongComments(
            await format(annotated, { ...config, filepath: file_path }),
        );
        const current = await readFile(file_path, 'utf8').catch(() => null);
        if (current === formatted) continue;
        stale.push(file_path);
        if (!check) {
            await mkdir(join(file_path, '..'), { recursive: true });
            await writeFile(file_path, formatted);
        }
    }
    // Remove generated files of controllers that the document does not have now.
    for (const entry of await readdir(operations_dir).catch(() => [])) {
        const file_path = join(operations_dir, entry);
        if (files.has(file_path)) continue;
        const text = await readFile(file_path, 'utf8');
        assert(text.startsWith(header(api)), `${file_path} is a generated file`);
        stale.push(file_path);
        if (!check) await rm(file_path);
    }

    console.log(
        `${api.repository}: ${kept.length} operations in ${controllers.size} controllers, ` +
            `${named.size} schemas.`,
    );
    if (skipped.length > 0) {
        const list = skipped.join(', ');
        console.log(`Skipped ${skipped.length} WebSocket and redirect endpoints: ${list}.`);
    }
    return stale;
}

/** Downloads the document. The generator stops if the download fails. */
async function downloadSpec(api: ApiSource): Promise<string> {
    const url = `https://raw.githubusercontent.com/${api.repository}/refs/heads/master/OPENAPI_DOC.yml`;
    const response = await fetch(url, { signal: AbortSignal.timeout(SPEC_TIMEOUT_MS) });
    assert(response.ok, `the download of ${url} succeeds (status ${response.status})`);
    const length_text = response.headers.get('content-length');
    if (length_text !== null) {
        assert(Number(length_text) <= SPEC_BYTES_MAX, 'the document is less than SPEC_BYTES_MAX');
    }
    const text = await response.text();
    assert(text.length <= SPEC_BYTES_MAX, 'the document is less than SPEC_BYTES_MAX');
    return text;
}

/**
 * Reads one operation of the document. Returns `null` for a WebSocket endpoint and for a redirect,
 * such as `short_url.redirect`: the useful part of a redirect is its `Location` header, which is
 * for a browser, and the client does not follow a redirect with an API key.
 */
function planOperation(
    api: ApiSource,
    schemas: SpecNode,
    path: string,
    method: (typeof METHODS)[number],
    operation: SpecNode,
): OperationPlan | null {
    const operation_id = asString(field(operation, 'operationId'), `${path} operationId`);
    const id = operation_id.startsWith(api.id_prefix)
        ? operation_id.slice(api.id_prefix.length)
        : '';
    const id_match = /^([A-Za-z:]+)_([a-z0-9_]+)$/.exec(id);
    assert(id_match !== null, `${operation_id} has the form ${api.id_prefix}Controller_action`);
    const controller = id_match[1] ?? '';
    // The list action of a controller is `index` in the server. The client calls it `query`.
    const action = (id_match[2] ?? '').replace(/^index(?=_\d+$|$)/, 'query');

    // The success response. The API has one for each operation.
    const responses = asNode(field(operation, 'responses'), `${operation_id} responses`);
    const successes = Object.keys(responses).filter((status) => /^[123]\d\d$/.test(status));
    assert(successes.length === 1, `${operation_id} has one success response`);
    const status = successes[0] ?? '';
    if (status === '101' || status.startsWith('3')) return null;

    const imports: Imports = { combinators: new Set(), schemas: new Set() };
    let response: string | null = null;
    const success = asNode(field(responses, status), `${operation_id} ${status}`);
    const content = field(success, 'content');
    if (JSON_RESPONSE_OPERATIONS.has(operation_id)) {
        assert(content === undefined, `${operation_id} has no response schema to replace`);
        imports.combinators.add('json');
        response = 'json()';
    } else if (content !== undefined) {
        const schema = asNode(jsonContentSchema(content, operation_id), `${operation_id} schema`);
        response = emitSchema(schemas, schema, imports, 0);
    }

    // The parameters: one object schema with the path parameters and the query parameters.
    const path_keys = [...path.matchAll(/\{([^}]+)\}/g)].map((match) => match[1] ?? '');
    const fields: string[] = [];
    const required: string[] = [];
    const parameter_names = new Set<string>();
    const wire_names: Record<string, string> = {};
    for (const parameter_value of asArray(field(operation, 'parameters') ?? [], operation_id)) {
        const parameter = asNode(parameter_value, `${operation_id} parameter`);
        const name = asString(field(parameter, 'name'), `${operation_id} parameter name`);
        const location = asString(field(parameter, 'in'), `${operation_id} ${name} in`);
        assert(location === 'path' || location === 'query', `${operation_id} ${name} is supported`);
        assert(!parameter_names.has(name), `${operation_id} ${name} is unique`);
        const key = PARAMETER_KEYS.get(operation_id)?.[name] ?? name;
        assert(key !== 'body', `${operation_id} has no parameter named body, or a key for it`);
        if (key !== name) {
            assert(location === 'query', `${operation_id} renames only a query parameter`);
            wire_names[key] = name;
        }
        parameter_names.add(name);
        if (location === 'path') {
            assert(path_keys.includes(name), `${operation_id} ${name} is in the path`);
            required.push(name);
        } else if (field(parameter, 'required') === true) {
            required.push(key);
        }
        const schema = asNode(field(parameter, 'schema'), `${operation_id} ${name} schema`);
        const expression = emitSchema(schemas, schema, imports, 0);
        const description = optionalString(field(parameter, 'description'), name) ?? '';
        fields.push(`${docComment(description, 4)}${propertyKey(key)}: ${expression},`);
    }
    for (const key of path_keys) {
        assert(parameter_names.has(key), `${operation_id} has a path parameter ${key}`);
    }
    imports.combinators.add('parameters');
    const required_list = required.length > 0 ? `, ${JSON.stringify(required)}` : '';
    const params = `parameters({\n${fields.join('\n')}\n}${required_list})`;

    let body: string | null = null;
    const request_body = field(operation, 'requestBody');
    if (request_body !== undefined) {
        const body_node = asNode(request_body, `${operation_id} requestBody`);
        assert(field(body_node, 'required') === true, `${operation_id} requires its body`);
        const schema = asNode(
            jsonContentSchema(field(body_node, 'content'), operation_id),
            `${operation_id} body schema`,
        );
        body = emitSchema(schemas, schema, imports, 0);
    }

    return {
        operation_id,
        controller,
        action,
        method,
        path,
        path_keys,
        summary: optionalString(field(operation, 'summary'), `${operation_id} summary`) ?? '',
        description: optionalString(field(operation, 'description'), operation_id) ?? '',
        params,
        params_required: required.length > 0 || body !== null,
        body,
        response,
        wire_names,
        imports,
    };
}

/**
 * The document numbers the routes of one action: `update` and `update_2`. This keeps one function
 * for each route that has its own signature:
 *
 * - PATCH and PUT of one path go to one method of the server. The PATCH stays.
 * - A second path with the same signature is an alias, such as `checkin` for `check_in`. The first
 *   path stays.
 * - Another path gets a name from its extra segments: `bookings/{id}/instance/{instance}` of
 *   `show` is `showInstance`.
 */
function mergeRoutes(operations: readonly OperationPlan[]): OperationPlan[] {
    const groups = new Map<string, OperationPlan[]>();
    for (const plan of operations) {
        const key = `${plan.controller}#${plan.action.replace(/_\d+$/, '')}`;
        groups.set(key, [...(groups.get(key) ?? []), plan]);
    }
    const kept: OperationPlan[] = [];
    for (const group of groups.values()) {
        const action = (group[0]?.action ?? '').replace(/_\d+$/, '');
        const by_path = new Map<string, OperationPlan[]>();
        for (const plan of group) by_path.set(plan.path, [...(by_path.get(plan.path) ?? []), plan]);
        const routes: OperationPlan[] = [];
        for (const plans of by_path.values()) {
            const [first, second] = plans;
            assert(first !== undefined, 'a path has a plan');
            if (second === undefined) {
                routes.push(first);
                continue;
            }
            assert(plans.length === 2, `${first.operation_id} has at most two methods on its path`);
            assert(
                sameSignature(first, second),
                `${first.operation_id} has the same signature as ${second.operation_id}`,
            );
            const methods = [first.method, second.method].sort().join();
            assert(methods === 'patch,put', `${first.operation_id} is a PATCH and PUT pair`);
            routes.push(first.method === 'patch' ? first : second);
        }
        const distinct: OperationPlan[] = [];
        for (const route of routes) {
            const alias = distinct.some(
                (other) => other.method === route.method && sameSignature(other, route),
            );
            if (!alias) distinct.push(route);
        }
        distinct.sort((a, b) => a.path.length - b.path.length);
        const [base, ...others] = distinct;
        assert(base !== undefined, 'an action has a route');
        kept.push({ ...base, action });
        const base_segments = new Set(base.path.split('/'));
        for (const other of others) {
            const extra = other.path
                .split('/')
                .filter((segment) => !base_segments.has(segment))
                .map((segment) => segment.replace(/[{}]/g, ''));
            const words = [...new Set(extra)];
            assert(words.length > 0, `${other.operation_id} has a path with more segments`);
            kept.push({ ...other, action: `${action}_${words.join('_')}` });
        }
    }
    return kept;
}

/** The same parameters, body and response. The path can differ. */
function sameSignature(a: OperationPlan, b: OperationPlan): boolean {
    return a.params === b.params && a.body === b.body && a.response === b.response;
}

/** The emit of a named schema. It applies the time field patches to its properties. */
function emitNamedSchema(
    api: ApiSource,
    schemas: SpecNode,
    spec_name: string,
    node: SpecNode,
    imports: Imports,
): string {
    const epoch_fields = new Set(SECONDS_FIELDS.get(spec_name) ?? []);
    const string_fields = new Set(STRING_TIME_FIELDS.get(spec_name) ?? []);
    const name = schemaTypeName(spec_name);
    const description = optionalString(field(node, 'description'), spec_name) ?? '';
    // The named interfaces make the declaration files and the editor hovers show `Zone`, not the
    // full shape at each use. The shape is in the schema only.
    const schema_name = `${name}Schema`;
    const doc = docComment(description, 0);
    if (field(node, 'properties') === undefined) {
        assert(epoch_fields.size === 0, `${spec_name} has the time fields of the patch`);
        imports.combinators.add('Output');
        imports.combinators.add('Input');
        imports.combinators.add('Schema');
        return (
            `const ${schema_name} = ${emitSchema(schemas, node, imports, 0)};\n` +
            `${doc}export type ${name} = Output<typeof ${schema_name}>;\n` +
            `export type ${name}Input = Input<typeof ${schema_name}>;\n` +
            `${doc}export const ${name}: Schema<${name}, ${name}Input> = ${schema_name};\n`
        );
    }
    const time_fields = { spec_name, epoch_fields, epoch_patch: api.epoch_patch, string_fields };
    const expression = emitObject(schemas, node, imports, 0, time_fields);
    imports.combinators.add('Output');
    imports.combinators.add('Input');
    imports.combinators.add('Schema');
    return (
        `const ${schema_name} = ${expression};\n` +
        `${doc}export interface ${name} extends Output<typeof ${schema_name}> {}\n` +
        `export interface ${name}Input extends Input<typeof ${schema_name}> {}\n` +
        `${doc}export const ${name}: Schema<${name}, ${name}Input> = ${schema_name};\n`
    );
}

/** The time field decisions of one named schema. */
interface TimeFields {
    readonly spec_name: string;
    /** The fields of `SECONDS_FIELDS`. */
    readonly epoch_fields: ReadonlySet<string>;
    /** See `ApiSource.epoch_patch`. */
    readonly epoch_patch: boolean;
    readonly string_fields: ReadonlySet<string>;
}

/** Returns the code of a schema expression, such as `nullable(string())`. */
function emitSchema(schemas: SpecNode, node: SpecNode, imports: Imports, depth: number): string {
    assert(depth < EMIT_DEPTH_MAX, 'the schema depth is less than EMIT_DEPTH_MAX');
    assertSupportedKeys(node);

    const ref = field(node, '$ref');
    if (ref !== undefined) {
        const spec_name = asString(ref, '$ref').replace('#/components/schemas/', '');
        assert(Object.hasOwn(schemas, spec_name), `the schema ${spec_name} exists`);
        if (spec_name === 'JSON.Any') {
            imports.combinators.add('json');
            return 'json()';
        }
        if (!isNamedSchema(spec_name)) {
            return emitSchema(
                schemas,
                asNode(field(schemas, spec_name), spec_name),
                imports,
                depth + 1,
            );
        }
        const name = schemaTypeName(spec_name);
        imports.schemas.add(name);
        return name;
    }

    const anyOf = field(node, 'anyOf');
    if (anyOf !== undefined) {
        const variants = asArray(anyOf, 'anyOf').map((variant) => asNode(variant, 'anyOf item'));
        const others = variants.filter((variant) => field(variant, 'type') !== 'null');
        assert(others.length > 0, 'an anyOf has a variant that is not null');
        const codes = others.map((variant) => emitSchema(schemas, variant, imports, depth + 1));
        let inner = codes[0] ?? '';
        if (codes.length > 1) {
            imports.combinators.add('union');
            inner = `union([${codes.join(', ')}])`;
        }
        if (others.length === variants.length) return inner;
        imports.combinators.add('nullable');
        return `nullable(${inner})`;
    }

    const enum_value = field(node, 'enum');
    if (enum_value !== undefined) {
        const values = asArray(enum_value, 'enum');
        const strings = values.every((value) => typeof value === 'string');
        const integers = values.every((value) => Number.isSafeInteger(value));
        assert(strings || integers, 'an enum has strings only or integers only');
        imports.combinators.add('literal');
        return `literal(${JSON.stringify(values)})`;
    }

    const type = field(node, 'type');
    const format_value = optionalString(field(node, 'format'), 'format');
    switch (type) {
        case 'string':
            assert(
                format_value === null || STRING_FORMATS.has(format_value),
                `format ${format_value}`,
            );
            imports.combinators.add('string');
            return 'string()';
        case 'integer':
            assert(
                format_value === null || INTEGER_FORMATS.has(format_value),
                `format ${format_value}`,
            );
            imports.combinators.add('integer');
            return format_value === null || format_value === 'Int64'
                ? 'integer()'
                : `integer('${format_value}')`;
        case 'number':
            assert(
                format_value === null || NUMBER_FORMATS.has(format_value),
                `format ${format_value}`,
            );
            imports.combinators.add('number');
            return 'number()';
        case 'boolean':
            imports.combinators.add('boolean');
            return 'boolean()';
        case 'array': {
            const prefix_items = field(node, 'prefixItems');
            if (prefix_items !== undefined) {
                // A Crystal `Tuple`: a fixed length and no other items.
                const list = asArray(prefix_items, 'prefixItems');
                assert(field(node, 'items') === false, 'a tuple has no other items');
                assert(field(node, 'minItems') === list.length, 'a tuple has a fixed length');
                assert(field(node, 'maxItems') === list.length, 'a tuple has a fixed length');
                const codes = list.map((item) =>
                    emitSchema(schemas, asNode(item, 'prefixItems item'), imports, depth + 1),
                );
                imports.combinators.add('tuple');
                return `tuple([${codes.join(', ')}])`;
            }
            assert(field(node, 'minItems') === undefined, 'an array has no minItems');
            assert(field(node, 'maxItems') === undefined, 'an array has no maxItems');
            imports.combinators.add('array');
            const items = field(node, 'items');
            if (items === undefined) {
                imports.combinators.add('json');
                return 'array(json())';
            }
            return `array(${emitSchema(schemas, asNode(items, 'items'), imports, depth + 1)})`;
        }
        case 'object': {
            if (field(node, 'properties') !== undefined) {
                return emitObject(schemas, node, imports, depth, null);
            }
            const values = field(node, 'additionalProperties');
            if (isRecord(values)) {
                imports.combinators.add('record');
                return `record(${emitSchema(schemas, values, imports, depth + 1)})`;
            }
            // The server writes `JSON::Any` as `{ type: object }`, but it can be any JSON value.
            imports.combinators.add('json');
            return 'json()';
        }
        case undefined:
            imports.combinators.add('json');
            return 'json()';
        default:
            assert(false, `the schema type ${JSON.stringify(type)} is supported`);
            return '';
    }
}

function emitObject(
    schemas: SpecNode,
    node: SpecNode,
    imports: Imports,
    depth: number,
    time_fields: TimeFields | null,
): string {
    // A named schema comes here without `emitSchema`, so check its keys here too. An object
    // with properties cannot also be one of these: the output would ignore them.
    assertSupportedKeys(node);
    for (const key of ['$ref', 'anyOf', 'enum', 'additionalProperties', 'items']) {
        assert(field(node, key) === undefined, `an object with properties has no "${key}"`);
    }
    const properties = asNode(field(node, 'properties'), 'properties');
    const required = asArray(field(node, 'required') ?? [], 'required').map((key) =>
        asString(key, 'required key'),
    );
    for (const key of required) assert(Object.hasOwn(properties, key), `required ${key} exists`);
    const fields: string[] = [];
    for (const [key, value] of Object.entries(properties)) {
        assert(key !== '__proto__', 'a property is not named __proto__');
        const property = asNode(value, `property ${key}`);
        let description = optionalString(field(property, 'description'), key) ?? '';
        let expression: string;
        const is_time = isDateTime(property);
        const value_enum_field =
            time_fields === null ? undefined : VALUE_ENUM_FIELDS.get(time_fields.spec_name)?.[key];
        const string_field =
            time_fields === null ? undefined : STRING_FIELDS.get(time_fields.spec_name)?.[key];
        if (time_fields === null) {
            expression = emitSchema(schemas, property, imports, depth + 1);
        } else if (value_enum_field !== undefined) {
            const target = `#/components/schemas/${value_enum_field.spec_name}`;
            const subject = `${time_fields.spec_name}.${key}`;
            assertPatchedShape(property, (node) => isOnly(node, { $ref: target }), subject);
            // A new member of the enum needs its number in the patch.
            const enum_node = asNode(
                field(schemas, value_enum_field.spec_name),
                'the patched enum',
            );
            assertSupportedKeys(enum_node);
            assert(
                isOnly(enum_node, { type: 'string', enum: field(enum_node, 'enum') }),
                `${value_enum_field.spec_name} is a string enum and nothing else`,
            );
            const members = asArray(field(enum_node, 'enum'), 'the patched enum values').map(
                String,
            );
            const mapped = Object.keys(value_enum_field.values);
            assert(
                [...members].sort().join() === [...mapped].sort().join(),
                `the numbers of ${value_enum_field.spec_name} cover each member of the enum`,
            );
            imports.combinators.add('literal');
            expression = `literal(${JSON.stringify(Object.values(value_enum_field.values))})`;
            if (isNullable(property)) {
                imports.combinators.add('nullable');
                expression = `nullable(${expression})`;
            }
            const names = Object.entries(value_enum_field.values).map(([n, v]) => `${v} ${n}`);
            const separator = description.length > 0 ? '\n\n' : '';
            description = `${description}${separator}The number of the enum: ${names.join(', ')}.`;
        } else if (string_field !== undefined) {
            const subject = `${time_fields.spec_name}.${key}`;
            const isBare = (node: SpecNode) => isOnly(node, { type: 'object' });
            const isBareArray = (node: SpecNode) => {
                const items = field(node, 'items');
                return isOnly(node, { type: 'array', items }) && isRecord(items) && isBare(items);
            };
            assertPatchedShape(property, string_field === 'string' ? isBare : isBareArray, subject);
            imports.combinators.add('string');
            expression = 'string()';
            if (string_field === 'array') {
                imports.combinators.add('array');
                expression = 'array(string())';
            }
            if (isNullable(property)) {
                imports.combinators.add('nullable');
                expression = `nullable(${expression})`;
            }
        } else if (time_fields.epoch_fields.has(key)) {
            const subject = `${time_fields.spec_name}.${key}`;
            const date_time = { type: 'string', format: 'date-time' };
            const int64 = { type: 'integer', format: 'Int64' };
            const shape = time_fields.epoch_patch ? date_time : int64;
            assertPatchedShape(property, (node) => isOnly(node, shape), subject);
            imports.combinators.add('integer');
            expression = 'integer()';
            if (isNullable(property)) {
                imports.combinators.add('nullable');
                expression = 'nullable(integer())';
            }
            const separator = description.length > 0 ? '\n\n' : '';
            description = `${description}${separator}Unix time in seconds.`;
        } else {
            const known = time_fields.string_fields.has(key);
            assert(is_time === known, `${time_fields.spec_name}.${key} has a time decision`);
            expression = emitSchema(schemas, property, imports, depth + 1);
        }
        fields.push(`${docComment(description, 4)}${propertyKey(key)}: ${expression},`);
    }
    if (time_fields !== null) {
        const keys = [...time_fields.epoch_fields, ...time_fields.string_fields];
        keys.push(...Object.keys(VALUE_ENUM_FIELDS.get(time_fields.spec_name) ?? {}));
        keys.push(...Object.keys(STRING_FIELDS.get(time_fields.spec_name) ?? {}));
        for (const key of keys) assert(Object.hasOwn(properties, key), `${key} is a property`);
        const added = Object.entries(ADDED_FIELDS.get(time_fields.spec_name) ?? {});
        for (const [key, property] of added) {
            // When the document gets the field, the patch must go.
            const subject = `${time_fields.spec_name}.${key}`;
            assert(!Object.hasOwn(properties, key), `${subject} is not in the document`);
            const description = optionalString(field(property, 'description'), key) ?? '';
            const code = emitSchema(schemas, property, imports, depth + 1);
            const expression = code === 'json()' ? code : `nullable(${code})`;
            if (code !== 'json()') imports.combinators.add('nullable');
            fields.push(`${docComment(description, 4)}${propertyKey(key)}: ${expression},`);
        }
    }
    imports.combinators.add('object');
    const required_list = required.length > 0 ? `, ${JSON.stringify(required)}` : '';
    return `object({\n${fields.join('\n')}\n}${required_list})`;
}

function assertSupportedKeys(node: SpecNode): void {
    for (const key of Object.keys(node)) {
        const supported = IGNORED_SCHEMA_KEYS.has(key) || SCHEMA_KEYS.has(key);
        assert(supported, `the schema key "${key}" is supported`);
    }
}

/**
 * A patched field must be the schema that the patch replaces, or an `anyOf` of it and `null`.
 * Any other shape is a change of the document that the patch would hide.
 */
function assertPatchedShape(
    property: SpecNode,
    isReplaced: (node: SpecNode) => boolean,
    subject: string,
): void {
    assertSupportedKeys(property);
    const anyOf = field(property, 'anyOf');
    if (anyOf === undefined) {
        assert(isReplaced(property), `${subject} has the shape that the patch replaces`);
        return;
    }
    assert(isOnly(property, { anyOf }), `${subject} is only an anyOf`);
    const variants = asArray(anyOf, `${subject} anyOf`).map((variant) => asNode(variant, subject));
    assert(variants.length === 2, `${subject} is the replaced schema or null`);
    for (const variant of variants) {
        assertSupportedKeys(variant);
        const known = isReplaced(variant) || isOnly(variant, { type: 'null' });
        assert(known, `${subject} has only the replaced schema and null`);
    }
    assert(variants.some(isReplaced), `${subject} has the schema that the patch replaces`);
}

/** True if `node` has exactly the fields of `expected`, ignoring the keys that change nothing. */
function isOnly(node: SpecNode, expected: Readonly<Record<string, unknown>>): boolean {
    const keys = Object.keys(node).filter((key) => !IGNORED_SCHEMA_KEYS.has(key));
    if (keys.length !== Object.keys(expected).length) return false;
    return keys.every((key) => Object.hasOwn(expected, key) && expected[key] === field(node, key));
}

function isDateTime(node: SpecNode): boolean {
    if (field(node, 'format') === 'date-time') return true;
    const anyOf = field(node, 'anyOf');
    if (anyOf === undefined) return false;
    return asArray(anyOf, 'anyOf').some(
        (variant) => field(asNode(variant, 'anyOf'), 'format') === 'date-time',
    );
}

function isNullable(node: SpecNode): boolean {
    const anyOf = field(node, 'anyOf');
    if (anyOf === undefined) return false;
    return asArray(anyOf, 'anyOf').some(
        (variant) => field(asNode(variant, 'anyOf'), 'type') === 'null',
    );
}

function jsonContentSchema(content: unknown, operation_id: string): unknown {
    const content_node = asNode(content, `${operation_id} content`);
    const types = Object.keys(content_node);
    assert(types.join() === 'application/json', `${operation_id} has JSON content only`);
    return field(asNode(field(content_node, 'application/json'), operation_id), 'schema');
}

function writeSchemasFile(
    api: ApiSource,
    named: ReadonlyMap<string, { code: string; imports: Imports }>,
): string {
    // A `const` must come after the schemas that it uses. The document has no cycles.
    const order: string[] = [];
    const state = new Map<string, 'visiting' | 'done'>();
    const visit = (name: string, depth: number): void => {
        assert(depth <= named.size, 'the schema graph has no cycles');
        const current = state.get(name);
        if (current === 'done') return;
        assert(current !== 'visiting', `the schema ${name} is not in a cycle`);
        state.set(name, 'visiting');
        const entry = named.get(name);
        assert(entry !== undefined, `the schema ${name} was emitted`);
        for (const dependency of [...entry.imports.schemas].sort()) visit(dependency, depth + 1);
        state.set(name, 'done');
        order.push(name);
    };
    for (const name of [...named.keys()].sort()) visit(name, 0);

    const combinators = new Set<string>();
    for (const entry of named.values()) {
        for (const combinator of entry.imports.combinators) combinators.add(combinator);
    }
    const body = order.map((name) => named.get(name)?.code ?? '').join('\n');
    const aliases = api.aliases.size > 0 ? `\n${aliasExports(api, named)}` : '';
    return `${header(api)}${importLine([...combinators], `${api.core}/schema.ts`)}\n${body}${aliases}`;
}

/** The exports of `TYPE_ALIASES`, for the value, the type and the input type. */
function aliasExports(api: ApiSource, named: ReadonlyMap<string, unknown>): string {
    const taken = new Set<string>();
    for (const name of named.keys())
        for (const suffix of ['', 'Input', 'Schema']) taken.add(name + suffix);
    const lines = ['/** Short names. Each one is the same value and type as the long name. */'];
    for (const [name, alias] of api.aliases) {
        assert(named.has(name), `the alias ${alias} has the schema ${name}`);
        for (const generated of [alias, `${alias}Input`]) {
            assert(!taken.has(generated), `the alias ${generated} is not a schema name`);
            assert(!CORE_NAMES.has(generated), `the alias ${generated} is not a core name`);
            taken.add(generated);
        }
        lines.push(`export { ${name} as ${alias}, type ${name}Input as ${alias}Input };`);
    }
    return `${lines.join('\n')}\n`;
}

function writeOperationsFile(
    api: ApiSource,
    controller: string,
    plans: readonly OperationPlan[],
): string {
    const combinators = new Set<string>();
    const schema_imports = new Set<string>();
    const function_names = new Set<string>();
    const blocks: string[] = [];
    for (const plan of [...plans].sort((a, b) => a.action.localeCompare(b.action, 'en'))) {
        for (const name of plan.imports.combinators) combinators.add(name);
        for (const name of plan.imports.schemas) schema_imports.add(name);
        const function_name = camelCase(plan.action.split('_'));
        assert(!RESERVED_WORDS.has(function_name), `${function_name} is not a reserved word`);
        assert(!function_names.has(function_name), `${controller}.${function_name} is unique`);
        function_names.add(function_name);
        const constant = plan.action.toUpperCase();
        const method = plan.method.toUpperCase();
        const text = [sentence(plan.summary), plan.description, `\`${method} ${plan.path}\``]
            .filter((part) => part.length > 0)
            .join('\n\n');
        const input_default = plan.params_required ? '' : ' = {}';
        blocks.push(
            `${docComment(text, 0)}export function ${function_name}(\n` +
                `input: OperationInput<typeof ${constant}>${input_default},\n` +
                `options?: CallOptions,\n` +
                `): Promise<CallResult<typeof ${constant}>> {\n` +
                `return call(${constant}, input, options);\n}\n\n` +
                `const ${constant} = operation({\n` +
                `method: '${method}',\n` +
                `path: ${JSON.stringify(plan.path)},\n` +
                `path_keys: ${JSON.stringify(plan.path_keys)},\n` +
                `params: ${plan.params},\n` +
                `body: ${plan.body ?? 'null'},\n` +
                `response: ${plan.response ?? 'null'},\n` +
                `name: '${api.name_prefix}${snakeCase(controllerWords(controller))}.${function_name}',\n` +
                (Object.keys(plan.wire_names).length > 0
                    ? `wire_names: ${JSON.stringify(plan.wire_names)},\n`
                    : '') +
                `});\n`,
        );
    }
    const namespace = snakeCase(controllerWords(controller));
    const intro =
        `/**\n * The \`${controller}\` controller of the API. Import it as the \`${namespace}\` ` +
        `namespace.\n *\n * @module\n */\n`;
    const schema_line =
        schema_imports.size > 0
            ? `import { ${[...schema_imports].sort().join(', ')} } from '../schemas.ts';\n`
            : '';
    return (
        `${header(api)}${intro}` +
        `import { call, operation, type CallOptions, type CallResult, ` +
        `type OperationInput } from '../${api.core}/client.ts';\n` +
        importLine([...combinators], `../${api.core}/schema.ts`) +
        `${schema_line}\n${blocks.join('\n')}`
    );
}

function importLine(names: readonly string[], from: string): string {
    const sorted = [...names].sort();
    const types = new Set(['Input', 'Output', 'Schema']);
    const parts = sorted.map((name) => (types.has(name) ? `type ${name}` : name));
    return `import { ${parts.join(', ')} } from '${from}';\n`;
}

/** True for a schema of the document that gets a name in the output. */
function isNamedSchema(spec_name: string): boolean {
    if (INLINE_SCHEMA_NAMES.has(spec_name)) return false;
    return /^[A-Za-z][A-Za-z0-9]*(\.[A-Za-z][A-Za-z0-9]*)*$/.test(spec_name);
}

/** `PlaceOS.Model.Playlist.Item` becomes `PlaylistItem`. Acronyms become words: `UserJwt`. */
function schemaTypeName(spec_name: string): string {
    let name = spec_name;
    for (const prefix of ['PlaceOS.Model.', 'PlaceOS.Api.', 'PlaceOS.Core.Client.', 'PlaceOS.']) {
        if (name.startsWith(prefix)) {
            name = name.slice(prefix.length);
            break;
        }
    }
    return name
        .split('.')
        .map((segment) => pascalCase(splitWords(segment)))
        .join('');
}

/** `Groups::Users` becomes the words `groups`, `users`. */
function controllerWords(controller: string): string[] {
    return controller.split('::').flatMap(splitWords);
}

/** Splits a Crystal name into lower case words. `OAuthApplications` is `oauth`, `applications`. */
function splitWords(name: string): string[] {
    const words = name.replace(/OAuth/g, 'Oauth').match(/[A-Z]+(?![a-z])|[A-Z]?[a-z]+|[0-9]+/g);
    assert(words !== null, `${name} has words`);
    assert(words.join('') === name.replace(/OAuth/g, 'Oauth'), `${name} splits into words`);
    return words.map((word) => word.toLowerCase());
}

function pascalCase(words: readonly string[]): string {
    return words.map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join('');
}

function camelCase(words: readonly string[]): string {
    const name = pascalCase(words);
    return name.charAt(0).toLowerCase() + name.slice(1);
}

/** The name of a namespace, such as `alert_dashboards`. */
function snakeCase(words: readonly string[]): string {
    return words.join('_');
}

function kebabCase(words: readonly string[]): string {
    return words.join('-');
}

function propertyKey(key: string): string {
    return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key) ? key : JSON.stringify(key);
}

/** `list the zones` becomes `List the zones.` */
function sentence(text: string): string {
    const trimmed = text.trim();
    if (trimmed.length === 0) return '';
    const capital = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
    return /[.!?]$/.test(capital) ? capital : `${capital}.`;
}

/**
 * Marks each schema and operation call as pure. Each one runs when its module loads, so without
 * the mark a bundler must keep every operation and schema of a module that the application
 * imports. With it, the bundler drops the ones that the application does not use. Comment lines
 * are not changed.
 */
function markPure(code: string): string {
    return code
        .split('\n')
        .map((line) => {
            const text = line.trimStart();
            if (text.startsWith('/*') || text.startsWith('*') || text.startsWith('//')) return line;
            return line.replace(PURE_CALL, '/* @__PURE__ */ $1(');
        })
        .join('\n');
}

/**
 * Wraps the comment lines that are longer than the line width. The formatter can indent a comment
 * more than `docComment` knew, and it does not wrap comments.
 */
function wrapLongComments(code: string): string {
    const output: string[] = [];
    for (const line of code.split('\n')) {
        if (line.length <= LINE_WIDTH_MAX) {
            output.push(line);
            continue;
        }
        const single = /^(\s*)\/\*\* (.*) \*\/$/.exec(line);
        const inner = /^(\s*) \* (.*)$/.exec(line);
        const match = single ?? inner;
        assert(match !== null, `a long generated line is a comment: ${line}`);
        const indent = match[1] ?? '';
        const lines = wrapWords(match[2] ?? '', LINE_WIDTH_MAX - indent.length - 3);
        if (single !== null) output.push(`${indent}/**`);
        for (const text of lines) output.push(`${indent} * ${text}`);
        if (single !== null) output.push(`${indent} */`);
    }
    return output.join('\n');
}

/** Splits text into lines of `width` characters or less. A longer word gets its own line. */
function wrapWords(text: string, width: number): string[] {
    assert(width > 0, 'the wrap width is more than zero');
    const lines: string[] = [];
    let line = '';
    for (const word of text.split(/\s+/)) {
        if (line.length > 0 && line.length + 1 + word.length > width) {
            lines.push(line);
            line = word;
        } else {
            line = line.length > 0 ? `${line} ${word}` : word;
        }
    }
    lines.push(line);
    return lines;
}

/** A JSDoc comment, wrapped to the line width. Empty text gives no comment. */
function docComment(text: string, indent: number): string {
    const trimmed = text.trim();
    if (trimmed.length === 0) return '';
    const width = LINE_WIDTH_MAX - indent - 3;
    const lines: string[] = [];
    for (const paragraph of trimmed.replaceAll('*/', '*\\/').split(/\n\s*\n/)) {
        if (lines.length > 0) lines.push('');
        lines.push(...wrapWords(paragraph, width));
    }
    if (lines.length === 1 && (lines[0] ?? '').length + 7 <= width) return `/** ${lines[0]} */\n`;
    return `/**\n${lines.map((line) => (line.length > 0 ? ` * ${line}` : ' *')).join('\n')}\n */\n`;
}

function field(node: SpecNode, key: string): unknown {
    return Object.hasOwn(node, key) ? node[key] : undefined;
}

function asNode(value: unknown, subject: string): SpecNode {
    assert(isRecord(value), `${subject} is an object`);
    return value;
}

function asArray(value: unknown, subject: string): readonly unknown[] {
    assert(Array.isArray(value), `${subject} is an array`);
    const items: readonly unknown[] = value;
    return items;
}

function asString(value: unknown, subject: string): string {
    assert(typeof value === 'string', `${subject} is a string`);
    return value;
}

function optionalString(value: unknown, subject: string): string | null {
    if (value === undefined) return null;
    return asString(value, subject);
}
