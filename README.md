# @placeos/ts-client

A typed client for the PlaceOS REST API and the staff API. A script generates the types and the
request functions from the OpenAPI documents of
[PlaceOS/rest-api](https://github.com/PlaceOS/rest-api/blob/master/OPENAPI_DOC.yml) and
[PlaceOS/staff-api](https://github.com/PlaceOS/staff-api/blob/master/OPENAPI_DOC.yml).

The library has no runtime dependencies. It runs in browsers, in Node 20.3 and later, and in Bun.

Version 7 is a new client, with a different API from 6.x. To move an application from 6.x, see
[Migrate from 6.x](#migrate-from-6x). The 6.x source is on the
[`6.x` branch](https://github.com/PlaceOS/ts-client/tree/6.x), which gets the 6.x fixes.

```sh
npm install @placeos/ts-client@next
```

Version 7 is a prerelease on the npm tag `next` until 7.0.0 is out. `@7` does not install a
prerelease.

## Use the client

```ts
import { configure, zones } from '@placeos/ts-client';

// Do this one time, when the application starts.
configure({
    base_url: 'https://placeos.example.com', // Use '' for the origin of the page.
    auth: { kind: 'bearer', token: () => localStorage.getItem('token') },
});

const result = await zones.show({ id: 'zone-1234', complete: true });
if (result.ok) {
    console.log(result.value.data.name);
} else {
    console.error(result.error.kind);
}
```

There is one namespace for each controller of the API, for example `zones`, `systems` and
`alert_dashboards`. Namespaces, options and fields are snake_case, as the data of the server is.
Functions are camelCase. Each function has the name of the server action: `show`, `create`,
`update`, `destroy`, or a custom action such as `systems.execute`. The `index` action is `query`,
because a list operation queries the items. The comment of each function gives the HTTP method and
the path.

The first argument has the path parameters, the query parameters and, for an operation with a
body, `body`. The second argument has the options of the request:

```ts
await zones.update({ id: 'zone-1234', body: { name: 'Level 2' } });
await systems.execute({
    sys_id: 'sys-1234',
    module_slug: 'Display_1',
    method: 'power',
    body: [true],
});
```

### Results and errors

A function does not throw for an expected failure. It returns a `Result`. Examine `ok` first:

| `error.kind`         | Meaning                                                                    |
| -------------------- | -------------------------------------------------------------------------- |
| `http`               | The server sent a status that is not 2xx. See `status`, `message`, `body`. |
| `network`            | The request got no response. For example, the network is down.             |
| `timeout`            | The request took more than `timeout_ms`.                                   |
| `aborted`            | The `signal` of the caller cancelled the request.                          |
| `auth_missing`       | The auth had no token or credential.                                       |
| `response_too_large` | The body was more than `response_bytes_max`.                               |
| `response_invalid`   | The body does not match the API document. See `path` and `expected`.       |

A function throws only for a programmer error. For example, a parameter that the operation does
not have, an empty path parameter, or a call before `configure`.

In a project without `strictNullChecks`, `if (!result.ok)` does not narrow the `Result`. Use
`if (result.ok === false)`.

### More than one client

`configure` makes the client that each call uses. To use a different client for one call, make it
with `createClient` and give it in the options. The configured client does not change:

```ts
const other = createClient({ base_url: 'https://other.example.com', auth: { kind: 'none' } });
await zones.query({}, { client: other });
```

### Timeouts and cancel

Each request has a time limit. The default is 30 seconds. Set a different limit for the client or
for one request:

```ts
configure({ base_url: '', auth: { kind: 'none' }, timeout_ms: 10_000 });
const controller = new AbortController();
await zones.query({}, { signal: controller.signal, timeout_ms: 60_000 });
```

### Pages

A `query` operation returns one page. `next()` of the reply requests the next page: the same
input with the offset of the `Link` header, through the same client. It gives `null` on the last
page:

```ts
let result = await zones.query({ limit: 100 });
while (result.ok) {
    show(result.value.data);
    const next = result.value.next();
    if (next === null) break;
    result = await next;
}
```

- Each operation with an `offset` parameter has `next()`, such as `zones.query`, `history.query`
  and `staff.bookings.query`. The compiler knows which ones do.
- `next(options)` replaces the options of the first call, such as `signal` or `timeout_ms`.
- `next()` also gives `null` when the offset of the link does not move forward, so that a loop over
  the pages always ends.
- `pageInfo(result.value.headers)` gives the `total` (`X-Total-Count`) and the `next_offset`.

### Tests and mocks

Give the client a `fetch` function. The client sends each request through it. A test can give
its own client in the options, so it does not change the configured client:

```ts
const client = createClient({
    base_url: '',
    auth: { kind: 'none' },
    fetch: async (url, init) => new Response(JSON.stringify({ id: 'zone-1' })),
});
const result = await zones.show({ id: 'zone-1' }, { client });
```

### Typed mocks

`@placeos/ts-client/mock` answers the calls of an endpoint without a request. The compiler checks
the name of the endpoint, the input that the handler gets, and the data that it gives:

```ts
import { endpointMocks, httpError, mockEndpoint, respond } from '@placeos/ts-client/mock';

configure({ base_url: '', auth: { kind: 'none' }, mock: endpointMocks });

mockEndpoint('zones.show', (input) => ({ id: input.id, name: 'Level 1' }));
mockEndpoint('zones.query', () => respond([{ id: 'zone-1' }], { total: 1 }));
mockEndpoint('systems.update', (input) => ({ id: input.sys_id, ...input.body }), { delay_ms: 300 });
mockEndpoint('zones.destroy', () => {
    throw httpError(403);
});
```

- The client checks the input first, as for a request. Then it parses the data of the handler with
  the response schema of the endpoint, as it parses a response. The data can leave out fields: a
  missing required field gets its empty value, such as `''`, `0` or `[]`. A field with the wrong
  type is a `response_invalid` error.
- `respond(data, { status, headers, total, next_offset })` sets the status and the headers.
  `total` is the `X-Total-Count` that `pageInfo` and `orThrowPage` read. `next_offset` goes in
  the `Link` header, so `next()` of the reply asks the mock for that page.
- `mockEndpoint` returns the function that removes the mock. `clearEndpointMocks()` removes all.
- A call to an endpoint without a mock goes to the `fetch` of the client. Give `mockFetch` of
  `@placeos/ts-client/compat` to answer it from the 6.x mock endpoints.
- `mock` of the client is a function. A test can give its own, which gets the name of the endpoint
  (such as `zones.show`) and the input, and returns an answer or `null`.

A test double of a 7.x call gives a `Result`. `mockReply` and `mockPage` of
`@placeos/ts-client/compat` make one:

```ts
vi.mock('@placeos/ts-client', { spy: true });
vi.mocked(zones.show).mockResolvedValue(mockReply(zone));
vi.mocked(zones.query).mockResolvedValue(mockPage({ data: [zone], total: 1 }));
```

### Mock mode

For new mocks, use [typed mocks](#typed-mocks). The 6.x mock endpoints and mock systems are in
`@placeos/ts-client/compat`, with the same names.
Give `mockFetch` to the client, and `mockRealtimeEnvironment()` to the realtime client:

```ts
registerMockEndpoint({
    path: '/api/engine/v2/zones/:id',
    method: 'GET',
    callback: (request) => ({ id: request.route_params['id'], name: 'Level 1' }),
});
registerSystem('sys-1', { Display: [{ power: false, $power: (on: boolean) => on }] });

configure({ base_url: '', auth: { kind: 'none' }, fetch: mockFetch, missing_fields: 'zero' });
const realtime = createRealtime({
    base_url: '',
    auth: { kind: 'none' },
    environment: mockRealtimeEnvironment(),
});
```

- 7.x parses each mock response with the schema of the operation. Mock data often has only some
  fields. `missing_fields: 'zero'` gives each missing required field its empty value, such as `''`,
  `0` or `[]`, as the 6.x classes did. A field with the wrong type is still an error, because the
  real server does not send it.
- A mock endpoint that throws an error with a `status`, such as `404`, gives that HTTP status.
- A change to a variable of a mock module, such as `mockSystem('sys-1')['Display'][0]['power']
= true`, notifies its bindings.

## Staff API

The staff API (bookings, events, guests, desks, surveys and more) is at
`@placeos/ts-client/staff`. It uses the client of `configure`, as the REST API functions do:

```ts
import { bookings } from '@placeos/ts-client/staff';

const now = Math.floor(Date.now() / 1000);
const result = await bookings.query({ period_start: now, period_end: now + 86_400, type: 'desk' });
```

- The staff API has its own schemas, such as `Booking` and `Guest`. A schema that both APIs have,
  such as `Zone`, is in both entries with the same shape.
- The typed mocks of the staff API start with `staff.`: `mockEndpoint('staff.bookings.show', ...)`.
- Some routes of the staff API have an occurrence of a recurring booking: `bookings.showInstance`
  is `GET /bookings/{id}/instance/{instance}`, the occurrence of `bookings.show`.

## Log in

`createAuthSession` does the OAuth login of PlaceOS and gives the client its credential:

```ts
import { configure, createAuthSession } from '@placeos/ts-client';

const session = createAuthSession({
    base_url: '',
    redirect_uri: `${location.origin}/oauth-resp.html`,
    scope: 'public',
    grant: { kind: 'code' },
});
configure({ base_url: '', auth: session.client_auth, headers: { 'X-App-Id': session.client_id } });

const result = await session.start();
if (!result.ok && result.error.kind === 'redirecting') {
    // The page goes to the login page now.
}
```

Copy `oauth-resp.html` from the package to your application, and use its URL as `redirect_uri`. The
client ID is the MD5 of `redirect_uri`, as in 6.x.

`session.start()` loads `/auth/authority`, and gets a credential in this order:

1. An API key from the URL or the storage (a fixed device), or an access token that is valid.
2. A code or a token from the redirect. The `state` must be the nonce of this client.
3. The refresh token.
4. The `password` or `entra` grant.
5. If the user has a session: the authorize page, with a redirect or, with `use_frame`, in a
   hidden frame.
6. Else the login page of the authority. With `handle_login: false`, the result is a
   `login_required` error, and the application shows its own login.

The grants are `code` (with PKCE), `implicit`, `password` and `entra`. PlaceOS auth.cr refuses
the `password` grant; only older auth services accept it. A trusted application (`?trust=true`)
keeps its tokens in the storage. Other applications keep them in memory only.

After a 401, the client asks the session for a new token and sends the request again, one time.
Parallel requests share one renewal. After a 511, the session sends the user to the login page.

Other parts of the session:

- `session.status()` and `session.subscribe(listener)` give the state: `loading`, `signed_in`,
  `redirecting` or `signed_out` with the error.
- `session.handleRedirect(url)` completes a login from a deep link, in a native wrapper.
- When the application comes back to the foreground without a session, the session loads the
  authority again. The user can have logged in from a different tab.
- `session.useToken`, `session.useApiKey`, `session.invalidateToken` and `session.logout`.
- `createAuthSession({ ..., environment })` replaces the browser parts, for tests or a native
  wrapper. See `AuthEnvironment`.

### Changes from 6.x

- The session keeps the storage keys of 6.x, so a user stays logged in after the change.
- The default token path is `/auth/oauth/token`. PlaceOS auth.cr and the older Ruby auth service
  both serve it. The Ruby auth service does not serve `/auth/token`.
- A relative login or logout URL of the authority is on `base_url`. 6.x used the `domain` of the
  authority, which has no port.
- A refused code stops the login with `token_rejected`. A new redirect could loop.
- The token requests send their parameters in the body, not in the URL. A password is not in the
  URL.
- A trusted application with the `implicit` grant uses the code with PKCE.
- The frame login checks the `state`. It needs the `oauth-resp.html` of 7.x.
- The session removes `x-api-key` from the URL after it reads it.
- With an API key, a call does not follow a redirect. It gets a `network` error. On a redirect to
  another origin, `fetch` removes `Authorization`, but it keeps `X-API-Key`.
- After a refused refresh token, the login continues immediately.
- A refusal on the consent page (`error=access_denied` with the state of this client) stops the
  login with `authorization_denied`. 6.x sent the user to the authorize page again.
- `/auth/authority` gets `AUTHORITY_ATTEMPTS_MAX` attempts, not an unlimited number. Then
  `start` gives `authority_unavailable`. Call `start` again to try again.
- The debug logs need a `log` function, such as `consoleLog` (see [Debug logs](#debug-logs)).
  `window.debug` alone does not turn them on. The logs do not have the cookie of the socket, which
  6.x logged with the token in it.
- Not ported: `revokeToken`, the state of the application in `authorise(state)`, and the ACA
  Engine API path. The mock mode is in `@placeos/ts-client/compat` (see [Mock mode](#mock-mode)).
  It does not need a login: give `auth: { kind: 'none' }`.

## Realtime

`createRealtime` opens one WebSocket to `systems/control`. It binds to the status variables of
modules, calls their functions and gets their logs:

```ts
import { createRealtime } from '@placeos/ts-client';

const realtime = createRealtime({ base_url: '', auth: session.client_auth });

const power = { sys: 'sys-1234', mod: 'Display', index: 1, name: 'power' };
const release = realtime.bind(power, (state) => {
    if (state.kind === 'value') console.log('power', state.value);
});
const result = await realtime.exec(power, [true]);
release();
```

- The client connects when the first binding or call needs it. `start` connects now.
- A binding has a count. The first `bind` sends `bind`. The last release sends `unbind`.
- After a new connection, the client binds each variable again.
- The client handles the messages of the server in batches. In one batch, many notifications for
  one variable give one call to its listeners, with the last value.
- `exec` gives a `Result` with the return value of the function, or a `RealtimeError`:
  `timeout`, `disconnected` (the socket closed after the server got the call), `stopped`,
  `unavailable`, `too_many_requests` or `server` (with the error code and the status).
- The client sends `ping` each 15 seconds. A socket without a message for 60 seconds closes, and
  the client connects again. It waits longer after each failure, to 5 seconds. After 40 attempts,
  the status is `failed`. Call `start` to try again.
- `realtime.debug({ sys, module_id }, listener)` gets the logs of a module.
- `splitModuleId('Display_2')` gives `{ mod: 'Display', index: 2 }`.
- In a browser, the token goes in a cookie on the socket path. In a frame and on mobile Safari it
  goes in the query, as in 6.x. `createRealtime({ ..., environment })` replaces the socket, the
  timers and the cookie, for tests.

### Changes from 6.x

- A call that the server got fails with `disconnected` when the socket closes. 6.x did not settle
  these calls.
- Two calls with the same arguments are two calls. 6.x merged them for one minute.
- Server errors have the correct code name. 6.x read the HTTP style status as the error code.
- `iface: true` addresses an interface, such as `Interface::Sensor`.
- After 40 failed attempts, the status is `failed`. 6.x reloaded the page.
- Not ported: the `connectionState` signal and the `/control/websocket` path of ACA Engine. The
  mock systems are in `@placeos/ts-client/compat` (see [Mock mode](#mock-mode)).

## Debug logs

The client, the login and the realtime client log nothing by default. Give each one a `log`
function to get an entry for each step: `{ scope, level, args }`. `args` are the arguments of the
call, as a console method gets them: a message, then values such as a status. `consoleLog` of
`@placeos/ts-client/compat` writes the entries in the console format of 6.x, and only when
`window.debug` is set:

```ts
import { consoleLog } from '@placeos/ts-client/compat';

const session = createAuthSession({ ..., log: consoleLog });
configure({ base_url: '', auth: session.client_auth, log: consoleLog });
const realtime = createRealtime({ base_url: '', auth: session.client_auth, log: consoleLog });
// In the console of the browser:
window.debug = true;
// [PlaceOS][Auth] the authority is loaded {id: 'authority-1'}
//     [PlaceOS][Auth] name: PlaceOS
//     [PlaceOS][Auth] domain: placeos.example.com
// [PlaceOS][HTTP] zones.query: 200 in 41 ms {name: 'zones.query', method: 'GET', ...}
// [PlaceOS][WS] sys-1 Display_1 power changed {sys: 'sys-1', ..., value: true}
```

| `scope`    | Entries                                                                         |
| ---------- | ------------------------------------------------------------------------------- |
| `auth`     | The steps of the login: the authority, each grant, redirects, renewals, logout. |
| `http`     | Each call: the name, the status or the error, and the time.                     |
| `realtime` | The socket: connect, close and reconnect, value changes, server errors, logs.   |
| `mock`     | The 6.x mock endpoints of `compat`: added, matched and not found.               |

| `level`     | Use                                                       | Console method     |
| ----------- | --------------------------------------------------------- | ------------------ |
| `error`     | A failure without an answer, such as a timeout.           | `console.error`    |
| `warn`      | A refusal or a drop, such as a 404 or a closed socket.    | `console.warn`     |
| `info`      | A step, such as a new token or a connected socket.        | `console.info`     |
| `debug`     | A detail, such as each call or an aborted call.           | `console.debug`    |
| `print`     | A line without a level, such as a field of the authority. | `console.log`      |
| `group`     | Starts a group of the entries that follow.                | `console.group`    |
| `group_end` | Ends the group.                                           | `console.groupEnd` |

- `createConsoleLog({ colors: false })` writes the same text without the `%c` colors.
- An entry has no tokens, API keys, cookies, request bodies or input values. A redirect gives its
  path only, because the query has the state of the login.
- A log function that throws does not change the call, the login or the socket.
- The `mock` entries of the 6.x mock endpoints always go to `consoleLog`, as in 6.x.
- In the library, each part logs through a scoped logger:
  `const log = scopedLog('auth', { sink: config.log ?? null })`. Its methods have the arguments
  of the console methods: `log.error(...data)`, `log.warn(...data)`, `log.info(...data)`,
  `log.debug(...data)`, `log.print(...data)` (`console.log`), `log.group(...label)` and
  `log.groupEnd()`. The `log` function of the application gets the entries.

## Types

Each schema of the API document has a value and two types with the same base name:

- `Zone` is the type of a zone from the server. Each field is present. A field that the server can
  leave out is `null`.
- `ZoneInput` is the type of a zone that you send. Each field is optional.
- The `Zone` value is the schema. `parseResponse(Zone, value)` parses data from other sources.

The parser removes the fields that the schema does not have. A request that has a field that the
schema does not have stops with an error, because a typing error in a field name is a bug.

Some schemas have a name from the server code that does not say what they are. These have a
short name too. The short name is the same value and type:

| Short name               | Name in the API document        |
| ------------------------ | ------------------------------- |
| `User`                   | `UserAdminMetadataResponse`     |
| `System`                 | `ControlSystem`                 |
| `Application`            | `DoorkeeperApplication`         |
| `Domain`                 | `Authority`                     |
| `Metadata`               | `MetadataInterface`             |
| `ShortUrl`               | `Shortener`                     |
| `SignageTemplateMapping` | `SignageTemplateSystemTemplate` |

`TYPE_ALIASES` in `scripts/generate.ts` has the list.

## Differences from the API document

The generator changes some parts of the document. Each change has a comment in
`scripts/generate.ts`.

- **Notes on numbers.** The documents give Unix times and some enums as integers, but not the unit
  or the names. The generator adds a note: "Unix time in seconds." on fields such as `created_at`,
  and the name of each number on enums such as `Driver.role` (`99` is `logic`). The lists come
  from the source of PlaceOS/models. The generator stops if a field of a list changes its type, or
  if it finds a `date-time` field that is not in a list, so each new field gets a decision.
- **Fields that refer back to `Booking`.** `Booking` has its guests, attendees and linked events,
  and these refer to `Booking` again. The client schemas cannot refer to themselves, so
  `Guest.booking` and the `linked_bookings` and `linked_parent_booking` fields are `JsonValue`.
- **A 204 without a body.** `staff.calendars.availability` sends 204 when no calendar matches. The
  data is then `null`.
- **Required fields in a request.** The document marks a field as required when the server always
  sends it. The server can have a default for the same field in a request. Thus each field of a
  request body is optional, and the server checks the body. Path and query parameters keep the
  `required` of the document.
- **Arrays in a query.** The server reads an array parameter as one value with commas, for example
  `zone_id=a,b`. The items of an array parameter must not contain commas.
- **PATCH and PUT.** The server sends PATCH and PUT of `update` to the same method. The client has
  only `update`, which sends PATCH.
- **Numbered routes.** The document numbers the routes of one action: `show` and `show_2`. A second
  path with the same signature is an alias, such as `checkin` for `check_in` in the staff API. The
  client has only the first path. A path with more segments gets a name from them, such as
  `showInstance` for `bookings/{id}/instance/{instance}`.
- **A query parameter named `body`.** `body` of the input is the request body, so the `body` query
  parameter of `staff.events.book` (the description of the meeting) is `body_text` in the input.
  The query keeps the name `body`.
- **Responses without a schema.** The data is a `Uint8Array` with the raw body. `systems.execute`,
  `modules.execute` and `modules.stateValue` are exceptions: they return a `JsonValue`.
- **WebSocket endpoints** (`systems/control`, `webrtc/signaller` and others) are not in the
  client. Also `short_url/{id}/redirect` is not in the client: the useful part of its answer is the
  `Location` header, which is for a browser.

## Change the generated code

Do not edit `src/generated`. The generator downloads the API documents from the master branches of
[PlaceOS/rest-api](https://github.com/PlaceOS/rest-api) and
[PlaceOS/staff-api](https://github.com/PlaceOS/staff-api) on each run. It does not keep a copy in
this repository. `APIS` in `scripts/generate.ts` has the list: the repository, the output folder
and the prefix of the operation IDs and names.

```sh
bun run generate         # Downloads the documents and writes src/generated and src/generated/staff.
bun run generate:check   # Fails if the generated files do not match the current documents.
```

The generated files are in the repository, so a change to the API shows as a diff. Examine the
diff before you commit it. `generate:check` can fail because the API changed, not because of your
change, so it is not part of `bun test` or of the checks of a PR.

Each day, the `Regenerate` workflow regenerates the client from the API documents on master
(`scripts/regenerate-pr.sh`). When the output changes, it opens a PR with the diff and the results
of the checks. It also closes the older regeneration PRs, because the new one has their changes.
When master matches the documents again, it closes all of them. Each run deletes the
regeneration branches that have no open PR, such as the branch of a merged PR. `DRY_RUN=1
scripts/regenerate-pr.sh` (from the root of the repository) shows what it would do. A manual run
of the workflow on another branch, such as `next`, regenerates that branch and opens the PR to it.

The commit of a regeneration PR is a `fix`, so its merge publishes a patch release. Before the
merge, change the commit message to a `feat` for new operations, or add a `BREAKING CHANGE:` footer
for a change that breaks apps.

The generator stops with an assertion on a part of the document that it does not support. Add the
support to `scripts/generate.ts` and `src/core/schema.ts`.

## Development

```sh
bun install
bun run check   # Type checks the library, the tests and the scripts.
bun test
bun run build   # Writes dist/. Then it type checks test/loose without `strict`.
bun run v1-map  # Writes the 6.x to 7.x map, from the source of the placeos-ts-client-6 package.
bun run docs    # Writes the API docs to docs/. It needs Deno.
```

### Releases

semantic-release publishes the package from the commit messages, with the `Release` workflow. A
`fix` commit gives a patch release, a `feat` commit gives a minor release, and a commit with a
`BREAKING CHANGE:` footer gives a major release. `release` in `package.json` has the branches:

| Branch   | Releases                                                                 |
| -------- | ------------------------------------------------------------------------ |
| `master` | To the npm tag `latest`. The API docs go to GitHub Pages.                |
| `next`   | Prereleases, such as `7.0.0-next.1`, to the npm tag `next`.              |
| `6.x`    | The fixes of 6.x, such as `6.13.1`. The workflow of that branch runs it. |

## Migrate from 6.x

The migration tool rewrites the 6.x calls of a project to 7.x. Commit your work first, so that you
can examine and undo the changes. Run it in the folder of the project, because it uses the
`typescript` package of the project:

```sh
npx -p @placeos/ts-client@next placeos-migrate src           # Shows the changes. Writes no file.
npx -p @placeos/ts-client@next placeos-migrate --write src   # Writes the changes.
```

The tool needs TypeScript 4.9 to 6.x, because TypeScript 7 has no JavaScript API. If the project
has TypeScript 7, or no TypeScript, give the tool TypeScript 5:

```sh
npx -p typescript@5 -p @placeos/ts-client@next placeos-migrate src
```

The tool makes these changes:

- A call of a 6.x REST function becomes the 7.x operation. `.then(orThrow)` gives the data, and an
  error rejects the promise, as in 6.x. A 6.x query function gets `.then(orThrowPage)`, which gives
  `{ data, total, next_offset }`.

    ```ts
    // 6.x
    const zone = await showZone(id, { complete: true });
    const list = await queryZones({ limit: 10 });
    // 7.x, after the tool
    const zone = await zones.show({ id, complete: true }).then(orThrow);
    const list = await zones.query({ limit: 10 }).then(orThrowPage);
    ```

- A type reference to a 6.x class becomes the 7.x type. For example, `PlaceZone` becomes `Zone`.
- The imports of the 6.x enums, such as `PlaceDriverRole`, and of `QueryResponse` move to
  `@placeos/ts-client/compat`. The enums have the 7.x values, so they fit the 7.x fields of the
  data. A query parameter takes the name: the `role` of `drivers.query` is `'logic'`, not `99`.
- A new import gets another name when the file has the name. For example, a file with a
  `zones` variable gets `zones as zones_v7`.

The tool also changes the test doubles, so that the tests of the app still work:

- `vi.mocked(showZone)`, `expect(showZone)`, `vi.spyOn(client, 'showZone')` and, in a spec file,
  each other use of `showZone` become `zones.show`.
- A value of `mockResolvedValue` gets `mockReply` or `mockPage`. The arguments of
  `toHaveBeenCalledWith` become the 7.x input.
- A 6.x implementation, such as the value of `mockImplementation`, gets `fromV1Mock`. It gives the
  implementation the 6.x arguments, and makes a 7.x result of its value.
- The 6.x functions of a `vi.mock('@placeos/ts-client', () => ({ ... }))` factory become 7.x
  namespaces: `showZone: vi.fn(impl)` becomes `zones: { show: vi.fn(fromV1Mock(impl, ['id',
'...'])) }`. The factory runs before the imports, so the tool adds `fromV1Mock` with
  `vi.hoisted`.
- The 6.x staff functions, such as `querySurveys`, become the operations of
  `@placeos/ts-client/staff`, with their own import.
- The imports of the mock endpoints and mock systems move to `@placeos/ts-client/compat`. See
  [Mock mode](#mock-mode).

The tool does not change a use that it cannot rewrite safely. It shows each one with a hint, and
it keeps its 6.x import, so the compiler also shows it. These uses are:

- the login and the realtime functions, such as `setup`, `token` and `getModule`;
- `get`, `post` and the other HTTP functions;
- `new` and `instanceof` on a 6.x class, because 7.x has plain objects;
- the `next` function of a 6.x page. In 7.x, `next()` is on the reply of the call;
- a function that is not called, out of a test;
- a `vi.mock` without a factory or `{ spy: true }`: its 7.x functions give `undefined`, and
  `.then(orThrow)` fails;
- a `jest.mock` factory with 6.x functions;
- in a `vi.mock` factory, a 6.x function that is a method, and a spread without a name, such as
  `...(await importOriginal())`;
- a test double in a variable, such as `const spy = vi.mocked(showZone)`: the tool changes the
  function, but not the calls on `spy`;
- an argument that has no place in 7.x, and an argument with side effects that 7.x uses two times.

On a copy of backoffice, 329 of the 399 tests pass after the tool. 6.x passes 394. The other tests
use 6.x classes, the 6.x `next` function or the 6.x `createSignal`, or wait for one microtask only.
These are the uses that the tool shows.

After the tool:

1. Run Prettier, or your formatter. The tool writes long imports on one line.
2. Install 7.x, and call `configure` once before the first call (see [Log in](#log-in)). For a
   mock mode, give `fetch: mockFetch` (see [Mock mode](#mock-mode)).
3. Run the compiler. It shows the differences of the data. For example, a field that can be
   `null`, an array that is `readonly`, or a query parameter that has a different type in 7.x.
4. Change the uses that the tool showed.

`orThrow` and `orThrowPage` keep the 6.x behavior. In new code, examine the `Result`.

The tool parses each file. It does not type check it. The map from 6.x to 7.x is
`src/migrate/v1-map.ts`. `scripts/v1-map.ts` makes it: it calls each 6.x REST function with marker
arguments, and it finds the 7.x operation with the same method and path.

## What 6.x has that 7.x does not have

- Classes with methods for each model. 7.x has plain data and functions.

## Exceptions to the design rules

The library gives errors as values, has no `any` and no unchecked casts, keeps no module state,
keeps its state in plain data, and keeps keyed data in a `Map`. These are the exceptions:

- `orThrow` and `orThrowPage` of `@placeos/ts-client/compat` throw. They are for code that moves
  from 6.x.
- The 6.x mock types of `@placeos/ts-client/compat` (`MockHttpRequest.body`, `metadata` and
  `MockModule`) keep `any`, so that the mocks of an app still compile.
- `missing_fields: 'zero'` accepts data without its required fields. It is for mock data only.
- `parseResponse`, `checkRequest` and `call` each have one `as` cast. The compiler cannot prove
  that the parser output has the type of the schema. The tests check the parser.
- `fromV1Mock` of `@placeos/ts-client/compat` has one `as` cast. It gives the result of a 6.x mock
  implementation, which has no types, the type of the test double that holds it.
- `configure` keeps one client in module state, so a call does not need a client argument. A
  call before `configure` is a run-time assertion, not a compile error.
- The mocks keep their registries in module state, as 6.x did: the endpoints of
  `registerMockEndpoint` and the systems of `registerSystem` (`@placeos/ts-client/compat`), and
  the mocks of `mockEndpoint` (`@placeos/ts-client/mock`). A test owns them. It removes them with
  `clearMockEndpoints`, `deregisterSystem` and `clearEndpointMocks`. Each registry has a named
  limit. The status variables of a mock module are properties with setters that notify the
  bindings, as in 6.x.
- `createAuthSession` keeps its state in a closure. The login is a state machine with I/O, and
  one object with one owner is the clearest model of it.
- Records from the server are plain objects, not `Map`s. A `Map` does not go through
  `JSON.stringify`, and the API sends these objects back and forth.
