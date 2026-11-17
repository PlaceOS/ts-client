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
| `auth_missing`       | The auth had no token or credential.                                       |
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

## Log in

`createAuthSession` does the OAuth login of PlaceOS and gives the client its credential:

```ts
import { configure, createAuthSession } from '@placeos/ts-client';

const session = createAuthSession({
    baseUrl: '',
    redirectUri: `${location.origin}/oauth-resp.html`,
    scope: 'public',
    grant: { kind: 'code' },
});
configure({ baseUrl: '', auth: session.clientAuth, headers: { 'X-App-Id': session.clientId } });

const result = await session.start();
if (!result.ok && result.error.kind === 'redirecting') {
    // The page goes to the login page now.
}
```

Copy `oauth-resp.html` from the package to your application, and use its URL as `redirectUri`. The
client ID is the MD5 of `redirectUri`, as in v1.

`session.start()` loads `/auth/authority`, and gets a credential in this order:

1. An API key from the URL or the storage (a fixed device), or an access token that is valid.
2. A code or a token from the redirect. The `state` must be the nonce of this client.
3. The refresh token.
4. The `password` or `entra` grant.
5. If the user has a session: the authorize page, with a redirect or, with `useFrame`, in a
   hidden frame.
6. Else the login page of the authority. With `handleLogin: false`, the result is a
   `login_required` error, and the application shows its own login.

The grants are `code` (with PKCE), `implicit`, `password` and `entra`. A trusted application
(`?trust=true`) keeps its tokens in the storage. Other applications keep them in memory only.

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

### Changes from v1

- The session keeps the storage keys of v1, so a user stays logged in after the change.
- The token requests send their parameters in the body, not in the URL. A password is not in the
  URL.
- A trusted application with the `implicit` grant uses the code with PKCE.
- The frame login checks the `state`. It needs the `oauth-resp.html` of v2.
- The session removes `x-api-key` from the URL after it reads it.
- After a refused refresh token, the login continues immediately.
- `/auth/authority` gets `AUTHORITY_ATTEMPTS_MAX` attempts, not an unlimited number. Then
  `start` gives `authority_unavailable`. Call `start` again to try again.
- Not ported: `revokeToken`, the mock mode (give a `fetch` to the client), the state of the
  application in `authorise(state)`, and the ACA Engine API path.

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

- The realtime WebSocket bindings.
- The mock systems. Give `createClient` a `fetch` function.
- Classes with methods for each model. v2 has plain data and functions.

## Where v2 does not follow TigerStyle

- `parseResponse`, `checkRequest` and `call` each have one `as` cast. The compiler cannot prove
  that the parser output has the type of the schema. The tests check the parser.
- `configure` keeps one client in module state, so a call does not need a client argument. A
  call before `configure` is a run-time assertion, not a compile error.
- `createAuthSession` keeps its state in a closure. The login is a state machine with I/O, and
  one object with one owner is the clearest model of it.
- Records from the server are plain objects, not `Map`s. A `Map` does not go through
  `JSON.stringify`, and the API sends these objects back and forth.
