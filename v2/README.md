# @placeos/ts-client v2

A typed client for the PlaceOS REST API and the staff API. A script generates the types and the
request functions from the OpenAPI documents of
[PlaceOS/rest-api](https://github.com/PlaceOS/rest-api/blob/master/OPENAPI_DOC.yml) and
[PlaceOS/staff-api](https://github.com/PlaceOS/staff-api/blob/master/OPENAPI_DOC.yml). The code follows [TigerStyle for JS/TS](https://github.com/tigerbeetle/tigerbeetle/blob/main/docs/TIGER_STYLE.md)
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

In a project without `strictNullChecks`, `if (!result.ok)` does not narrow the `Result`. Use
`if (result.ok === false)`.

### More than one client

`configure` makes the client that each call uses. To use a different client for one call, make it
with `createClient` and give it in the options. The configured client does not change:

```ts
const other = createClient({ baseUrl: 'https://other.example.com', auth: { kind: 'none' } });
await zones.query({}, { client: other });
```

### Timeouts and cancel

Each request has a time limit. The default is 30 seconds. Set a different limit for the client or
for one request:

```ts
configure({ baseUrl: '', auth: { kind: 'none' }, timeoutMs: 10_000 });
const controller = new AbortController();
await zones.query({}, { signal: controller.signal, timeoutMs: 60_000 });
```

### Pages

An `index` operation returns one page. Use `pageInfo` to get the total and the next offset:

```ts
import { pageInfo, zones } from '@placeos/ts-client';

const result = await zones.query({ limit: 100 });
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

### Typed mocks

`@placeos/ts-client/mock` answers the calls of an endpoint without a request. The compiler checks
the name of the endpoint, the input that the handler gets, and the data that it gives:

```ts
import { endpointMocks, httpError, mockEndpoint, respond } from '@placeos/ts-client/mock';

configure({ baseUrl: '', auth: { kind: 'none' }, mock: endpointMocks });

mockEndpoint('zones.show', (input) => ({ id: input.id, name: 'Level 1' }));
mockEndpoint('zones.query', () => respond([{ id: 'zone-1' }], { total: 1 }));
mockEndpoint('systems.update', (input) => ({ id: input.sys_id, ...input.body }), { delayMs: 300 });
mockEndpoint('zones.destroy', () => {
    throw httpError(403);
});
```

- The client checks the input first, as for a request. Then it parses the data of the handler with
  the response schema of the endpoint, as it parses a response. The data can leave out fields: a
  missing required field gets its empty value, such as `''`, `0` or `[]`. A field with the wrong
  type is a `response_invalid` error.
- `respond(data, { status, headers, total })` sets the status and the headers. `total` is the
  `X-Total-Count` that `pageInfo` and `orThrowPage` read.
- `mockEndpoint` returns the function that removes the mock. `clearEndpointMocks()` removes all.
- A call to an endpoint without a mock goes to the `fetch` of the client. Give `mockFetch` of
  `@placeos/ts-client/compat` to answer it from the v1 mock endpoints.
- `mock` of the client is a function. A test can give its own, which gets the name of the endpoint
  (such as `zones.show`) and the input, and returns an answer or `null`.

A test double of a v2 call gives a `Result`. `mockReply` and `mockPage` of
`@placeos/ts-client/compat` make one:

```ts
vi.mock('@placeos/ts-client', { spy: true });
vi.mocked(zones.show).mockResolvedValue(mockReply(zone));
vi.mocked(zones.query).mockResolvedValue(mockPage({ data: [zone], total: 1 }));
```

### Mock mode

For new mocks, use [typed mocks](#typed-mocks). The v1 mock endpoints and mock systems are in
`@placeos/ts-client/compat`, with the same names.
Give `mockFetch` to the client, and `mockRealtimeEnvironment()` to the realtime client:

```ts
registerMockEndpoint({
    path: '/api/engine/v2/zones/:id',
    method: 'GET',
    callback: (request) => ({ id: request.route_params['id'], name: 'Level 1' }),
});
registerSystem('sys-1', { Display: [{ power: false, $power: (on: boolean) => on }] });

configure({ baseUrl: '', auth: { kind: 'none' }, fetch: mockFetch, missingFields: 'zero' });
const realtime = createRealtime({
    baseUrl: '',
    auth: { kind: 'none' },
    environment: mockRealtimeEnvironment(),
});
```

- v2 parses each mock response with the schema of the operation. Mock data often has only some
  fields. `missingFields: 'zero'` gives each missing required field its empty value, such as `''`,
  `0` or `[]`, as the v1 classes did. A field with the wrong type is still an error, because the
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

### Changes from v1

- The session keeps the storage keys of v1, so a user stays logged in after the change.
- The default token path is `/auth/oauth/token`. PlaceOS auth.cr and the older Ruby auth service
  both serve it. The Ruby auth service does not serve `/auth/token`.
- A relative login or logout URL of the authority is on `baseUrl`. v1 used the `domain` of the
  authority, which has no port.
- A refused code stops the login with `token_rejected`. A new redirect could loop.
- The token requests send their parameters in the body, not in the URL. A password is not in the
  URL.
- A trusted application with the `implicit` grant uses the code with PKCE.
- The frame login checks the `state`. It needs the `oauth-resp.html` of v2.
- The session removes `x-api-key` from the URL after it reads it.
- After a refused refresh token, the login continues immediately.
- A refusal on the consent page (`error=access_denied` with the state of this client) stops the
  login with `authorization_denied`. v1 sent the user to the authorize page again.
- `/auth/authority` gets `AUTHORITY_ATTEMPTS_MAX` attempts, not an unlimited number. Then
  `start` gives `authority_unavailable`. Call `start` again to try again.
- Not ported: `revokeToken`, the state of the application in `authorise(state)`, and the ACA
  Engine API path. The mock mode is in `@placeos/ts-client/compat` (see [Mock mode](#mock-mode)).
  It does not need a login: give `auth: { kind: 'none' }`.

## Realtime

`createRealtime` opens one WebSocket to `systems/control`. It binds to the status variables of
modules, calls their functions and gets their logs:

```ts
import { createRealtime } from '@placeos/ts-client';

const realtime = createRealtime({ baseUrl: '', auth: session.clientAuth });

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
- `realtime.debug({ sys, moduleId }, listener)` gets the logs of a module.
- `splitModuleId('Display_2')` gives `{ mod: 'Display', index: 2 }`.
- In a browser, the token goes in a cookie on the socket path. In a frame and on mobile Safari it
  goes in the query, as in v1. `createRealtime({ ..., environment })` replaces the socket, the
  timers and the cookie, for tests.

### Changes from v1

- A call that the server got fails with `disconnected` when the socket closes. v1 did not settle
  these calls.
- Two calls with the same arguments are two calls. v1 merged them for one minute.
- Server errors have the correct code name. v1 read the HTTP style status as the error code.
- `iface: true` addresses an interface, such as `Interface::Sensor`.
- After 40 failed attempts, the status is `failed`. v1 reloaded the page.
- Not ported: the `connectionState` signal and the `/control/websocket` path of ACA Engine. The
  mock systems are in `@placeos/ts-client/compat` (see [Mock mode](#mock-mode)).

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

- **Time fields.** The document says `date-time` for some fields that the server sends as Unix time
  in seconds, for example `created_at` on most models. The generator changes these fields to
  integers. The list comes from the source of PlaceOS/models. The generator stops if it finds a
  `date-time` field that is not in a list, so each new field gets a decision.
- **Enum numbers.** The server sends some enums as numbers, for example `Driver.role` (`99` is
  `logic`). The document gives their names. The generator changes these fields to the numbers.
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
  client.

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

Each day, the `v2 regenerate` workflow regenerates the client from the API documents on master
(`scripts/regenerate-pr.sh`). When the output changes, it opens a PR with the diff and the results
of the checks. It also closes the older regeneration PRs, because the new one has their changes.
When master matches the documents again, it closes all of them. Each run deletes the
regeneration branches that have no open PR, such as the branch of a merged PR. `DRY_RUN=1
scripts/regenerate-pr.sh` (from the root of the repository) shows what it would do.

The generator stops with an assertion on a part of the document that it does not support. Add the
support to `scripts/generate.ts` and `src/core/schema.ts`.

## Development

```sh
bun install
bun run check   # Type checks the library, the tests and the scripts.
bun test
bun run build   # Writes dist/. Then it type checks test/loose without `strict`.
bun run v1-map  # Writes the v1 to v2 map. It needs `npm install` in the v1 folder.
```

## Migrate from v1

The migration tool rewrites the v1 calls of a project to v2. Commit your work first, so that you
can examine and undo the changes. Run it in the folder of the project, because it uses the
`typescript` package of the project:

```sh
npx -p @placeos/ts-client@2 placeos-migrate src           # Shows the changes. Writes no file.
npx -p @placeos/ts-client@2 placeos-migrate --write src   # Writes the changes.
```

The tool makes these changes:

- A call of a v1 REST function becomes the v2 operation. `.then(orThrow)` gives the data, and an
  error rejects the promise, as in v1. A v1 query function gets `.then(orThrowPage)`, which gives
  `{ data, total, nextOffset }`.

    ```ts
    // v1
    const zone = await showZone(id, { complete: true });
    const list = await queryZones({ limit: 10 });
    // v2, after the tool
    const zone = await zones.show({ id, complete: true }).then(orThrow);
    const list = await zones.query({ limit: 10 }).then(orThrowPage);
    ```

- A type reference to a v1 class becomes the v2 type. For example, `PlaceZone` becomes `Zone`.
- The imports of the v1 enums, such as `PlaceDriverRole`, and of `QueryResponse` move to
  `@placeos/ts-client/compat`. The enums have the v2 values, so they fit the v2 fields of the
  data. A query parameter takes the name: the `role` of `drivers.query` is `'logic'`, not `99`.
- A new import gets another name when the file has the name. For example, a file with a
  `zones` variable gets `zones as zonesV2`.

The tool also changes the test doubles, so that the tests of the app still work:

- `vi.mocked(showZone)`, `expect(showZone)`, `vi.spyOn(client, 'showZone')` and, in a spec file,
  each other use of `showZone` become `zones.show`.
- A value of `mockResolvedValue` gets `mockReply` or `mockPage`. The arguments of
  `toHaveBeenCalledWith` become the v2 input.
- A v1 implementation, such as the value of `mockImplementation`, gets `fromV1Mock`. It gives the
  implementation the v1 arguments, and makes a v2 result of its value.
- The v1 functions of a `vi.mock('@placeos/ts-client', () => ({ ... }))` factory become v2
  namespaces: `showZone: vi.fn(impl)` becomes `zones: { show: vi.fn(fromV1Mock(impl, ['id',
'...'])) }`. The factory runs before the imports, so the tool adds `fromV1Mock` with
  `vi.hoisted`.
- The v1 staff functions, such as `querySurveys`, become the operations of
  `@placeos/ts-client/staff`, with their own import.
- The imports of the mock endpoints and mock systems move to `@placeos/ts-client/compat`. See
  [Mock mode](#mock-mode).

The tool does not change a use that it cannot rewrite safely. It shows each one with a hint, and
it keeps its v1 import, so the compiler also shows it. These uses are:

- the login and the realtime functions, such as `setup`, `token` and `getModule`;
- `get`, `post` and the other HTTP functions;
- `new` and `instanceof` on a v1 class, because v2 has plain objects;
- the `next` function of a v1 page. v2 gives `nextOffset`;
- a function that is not called, out of a test;
- a `vi.mock` without a factory or `{ spy: true }`: its v2 functions give `undefined`, and
  `.then(orThrow)` fails;
- a `jest.mock` factory with v1 functions;
- an argument that has no place in v2, and an argument with side effects that v2 uses two times.

On a copy of backoffice, 329 of the 399 tests pass after the tool. v1 passes 394. The other tests
use v1 classes, the v1 `next` function or the v1 `createSignal`, or wait for one microtask only.
These are the uses that the tool shows.

After the tool:

1. Run Prettier, or your formatter. The tool writes long imports on one line.
2. Install v2, and call `configure` once before the first call (see [Log in](#log-in)). For a
   mock mode, give `fetch: mockFetch` (see [Mock mode](#mock-mode)).
3. Run the compiler. It shows the differences of the data. For example, a field that can be
   `null`, an array that is `readonly`, or a query parameter that has a different type in v2.
4. Change the uses that the tool showed.

`orThrow` and `orThrowPage` keep the v1 behavior. In new code, examine the `Result`.

The tool parses each file. It does not type check it. The map from v1 to v2 is
`src/migrate/v1-map.ts`. `scripts/v1-map.ts` makes it: it calls each v1 REST function with marker
arguments, and it finds the v2 operation with the same method and path.

## What v1 has that v2 does not have

- Classes with methods for each model. v2 has plain data and functions.

## Where v2 does not follow TigerStyle

- `orThrow` and `orThrowPage` of `@placeos/ts-client/compat` throw. They are for code that moves
  from v1.
- The v1 mock types of `@placeos/ts-client/compat` (`MockHttpRequest.body`, `metadata` and
  `MockModule`) keep `any`, so that the mocks of an app still compile.
- `missingFields: 'zero'` accepts data without its required fields. It is for mock data only.
- `parseResponse`, `checkRequest` and `call` each have one `as` cast. The compiler cannot prove
  that the parser output has the type of the schema. The tests check the parser.
- `configure` keeps one client in module state, so a call does not need a client argument. A
  call before `configure` is a run-time assertion, not a compile error.
- The mocks keep their registries in module state, as v1 did: the endpoints of
  `registerMockEndpoint` and the systems of `registerSystem` (`@placeos/ts-client/compat`), and
  the mocks of `mockEndpoint` (`@placeos/ts-client/mock`). A test owns them. It removes them with
  `clearMockEndpoints`, `deregisterSystem` and `clearEndpointMocks`. Each registry has a named
  limit. The status variables of a mock module are properties with setters that notify the
  bindings, as in v1.
- `createAuthSession` keeps its state in a closure. The login is a state machine with I/O, and
  one object with one owner is the clearest model of it.
- Records from the server are plain objects, not `Map`s. A `Map` does not go through
  `JSON.stringify`, and the API sends these objects back and forth.
