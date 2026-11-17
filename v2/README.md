# @placeos/ts-client v2

A typed client for the PlaceOS REST API. A script generates the types and the request functions
from the [OpenAPI document](https://github.com/PlaceOS/rest-api/blob/master/OPENAPI_DOC.yml) of
the API. The code follows [TigerStyle for JS/TS](https://github.com/tigerbeetle/tigerbeetle/blob/main/docs/TIGER_STYLE.md)
where possible.

The library has no runtime dependencies. It runs in browsers, in Node 20.3 and later, and in Bun.

## Use the client

```ts
import { configure, zones } from '@placeos/ts-client';

// Do this one time, when the application starts.
configure({
    baseUrl: 'https://placeos.example.com', // Use '' for the origin of the page.
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
`users`. Each function has the name of the server action: `index`, `show`, `create`, `update`,
`destroy`, or a custom action such as `systems.execute`. The comment of each function gives the
HTTP method and the path.

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
| `timeout`            | The request took more than `timeoutMs`.                                    |
| `aborted`            | The `signal` of the caller cancelled the request.                          |
| `auth_missing`       | The `token` function of the `bearer` auth gave `null`.                     |
| `response_too_large` | The body was more than `responseBytesMax`.                                 |
| `response_invalid`   | The body does not match the API document. See `path` and `expected`.       |

A function throws only for a programmer error. For example, a parameter that the operation does
not have, an empty path parameter, or a call before `configure`.

### More than one client

`configure` makes the client that each call uses. To use a different client for one call, make it
with `createClient` and give it in the options. The configured client does not change:

```ts
const other = createClient({ baseUrl: 'https://other.example.com', auth: { kind: 'none' } });
await zones.index({}, { client: other });
```

### Timeouts and cancel

Each request has a time limit. The default is 30 seconds. Set a different limit for the client or
for one request:

```ts
configure({ baseUrl: '', auth: { kind: 'none' }, timeoutMs: 10_000 });
const controller = new AbortController();
await zones.index({}, { signal: controller.signal, timeoutMs: 60_000 });
```

### Pages

An `index` operation returns one page. Use `pageInfo` to get the total and the next offset:

```ts
import { pageInfo, zones } from '@placeos/ts-client';

const result = await zones.index({ limit: 100 });
if (result.ok) {
    const { total, nextOffset } = pageInfo(result.value.headers);
}
```

### Tests and mocks

Give the client a `fetch` function. The client sends each request through it. A test can give
its own client in the options, so it does not change the configured client:

```ts
const client = createClient({
    baseUrl: '',
    auth: { kind: 'none' },
    fetch: async (url, init) => new Response(JSON.stringify({ id: 'zone-1' })),
});
const result = await zones.show({ id: 'zone-1' }, { client });
```

## Types

Each schema of the API document has a value and two types with the same base name:

- `Zone` is the type of a zone from the server. Each field is present. A field that the server can
  leave out is `null`.
- `ZoneInput` is the type of a zone that you send. Each field is optional.
- The `Zone` value is the schema. `parseResponse(Zone, value)` parses data from other sources.

The parser removes the fields that the schema does not have. A request that has a field that the
schema does not have stops with an error, because a typing error in a field name is a bug.

## Differences from the API document

The generator changes some parts of the document. Each change has a comment in
`scripts/generate.ts`.

- **Time fields.** The document says `date-time` for some fields that the server sends as Unix time
  in seconds, for example `created_at` on most models. The generator changes these fields to
  integers. The list comes from the source of PlaceOS/models. The generator stops if it finds a
  `date-time` field that is not in a list, so each new field gets a decision.
- **Required fields in a request.** The document marks a field as required when the server always
  sends it. The server can have a default for the same field in a request. Thus each field of a
  request body is optional, and the server checks the body. Path and query parameters keep the
  `required` of the document.
- **Arrays in a query.** The server reads an array parameter as one value with commas, for example
  `zone_id=a,b`. The items of an array parameter must not contain commas.
- **PATCH and PUT.** The server sends PATCH and PUT of `update` to the same method. The client has
  only `update`, which sends PATCH.
- **Responses without a schema.** The data is a `Uint8Array` with the raw body. `systems.execute`,
  `modules.execute` and `modules.stateValue` are exceptions: they return a `JsonValue`.
- **WebSocket endpoints** (`systems/control`, `webrtc/signaller` and others) are not in the
  client.

## Change the generated code

Do not edit `src/generated`. The generator downloads the API document from the master branch of
[PlaceOS/rest-api](https://github.com/PlaceOS/rest-api) on each run. It does not keep a copy in
this repository.

```sh
bun run generate         # Downloads the document and writes src/generated.
bun run generate:check   # Fails if src/generated does not match the current document.
```

The generated files are in the repository, so a change to the API shows as a diff. Examine the
diff before you commit it. `generate:check` can fail because the API changed, not because of your
change, so it is not part of `bun test`.

The generator stops with an assertion on a part of the document that it does not support. Add the
support to `scripts/generate.ts` and `src/core/schema.ts`.

## Development

```sh
bun install
bun run check   # Type checks the library, the tests and the scripts.
bun test
bun run build   # Writes dist/.
```

## What v1 has that v2 does not have

- The OAuth login flow and the token storage. Give the `bearer` auth a `token` function.
- The realtime WebSocket bindings.
- The mock systems. Give `createClient` a `fetch` function.
- Classes with methods for each model. v2 has plain data and functions.

## Where v2 does not follow TigerStyle

- `parseResponse`, `checkRequest` and `call` each have one `as` cast. The compiler cannot prove
  that the parser output has the type of the schema. The tests check the parser.
- Records from the server are plain objects, not `Map`s. A `Map` does not go through
  `JSON.stringify`, and the API sends these objects back and forth.
