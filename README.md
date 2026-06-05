# TypeScript PlaceOS Library

This library is a Typescript interface to PlaceOS

## Compilation

You can build the library from source after installing the dependencies with the command

`npm run build`

## Usage

API docs can be found [here](https://placeos.github.io/ts-client)

You can install the PlaceOS Typescript client with the npm command

`npm install --save-dev @placeos/ts-client`

Before using PlaceOS it will need to be initialised.

```typescript
import { setup } from '@placeos/ts-client';

setup(config).then(() => doAfterAuthInitialised());
```

The setup method returns a promise that resolves after the auth flow has completed.
The setup method takes a `config` object with the following properties

| Property         | Description                                             | Optional | Type                       | Example                    |
| ---------------- | ------------------------------------------------------- | -------- | -------------------------- | -------------------------- |
| `host`           | Host name and port of the PlaceOS server                | Yes      | `string`                   | `"dev.placeos.com:8080"`   |
| `mock`           | Whether to initialise PlaceOS with mock services        | Yes      | `boolean`                  | `true`                     |
| `auth_uri`       | URI for authorising users session                       | No       | `string`                   | `"/auth/oauth/authorize"`  |
| `token_uri`      | URI for generating new auth tokens                      | No       | `string`                   | `"/auth/token"`            |
| `redirect_uri`   | URI to redirect user to after authorising session       | No       | `string`                   | `"/oauth-resp.html"`       |
| `scope`          | Scope of the user permissions needed by the application | No       | `string`                   | `"admin"`                  |
| `storage`        | Browser storage to use for storing user credentials     | Yes      | `"local" \| "session"`     | "session"`                 |
| `handle_login`   | Whether PlaceOS should handle user login                | Yes      | `boolean`                  | `true`                     |
| `use_iframe`     | Use iFrame for authorization of application             | Yes      | `boolean`                  | `false`                    |
| `secure`         | Force requests to backend to be secure i.e. HTTPS/WSS   | Yes      | `boolean`                  | `false`                    |
| `ignore_api_key` | Ignore set API keys when authenticating requests        | Yes      | `boolean`                  | `false`                    |
| `token_header`   | Force all requests to use headers for auth over cookies | Yes      | `boolean`                  | `false`                    |
| `username`       | Username to use for basic authentication                | Yes      | `string`                   | `"user@place.os"`          |
| `password`       | Password to use for basic authentication                | Yes      | `string`                   | `"hard-to-guest-password"` |
| `auth_type`      | Type of authentication to perform                       | Yes      | `"implicit" \| "password"` | `"implicit"`               |

#### Local Development with live environments

You will not be able to use SSO for local development by default.
To solve this you will either need to:

- Reverse proxy the development UI through the live environment
- Reverse proxy the `/login` endpoint from the live environment to the local development environment then perform basic login instead
- Use an API key to authenticate with the backend

If you're not proxying the local development UI through the live server it is recommended to reverse proxy all the API endpoints to prevent any possible CORS issues.

### Websocket API

`PlaceOS` exposes a websocket API through the `realtime` entrypoint.

The `realtime` entrypoint provides methods for real-time interaction with modules running on PlaceOS. It provides an interface to build efficient, responsive user interfaces, monitoring systems and other extensions which require live, two-way or asynchronous interaction.

Once PlaceOS has initialised you can listen to values on modules

```typescript
import { getModule } from '@placeos/ts-client';

const my_mod = getModule('sys-death-star', 'TestModule', 3);
const my_variable = my_mod.variable('power');
const unbind = my_variable.bind();
const unsubscribe = my_variable.subscribe((value) => doSomething(value));

// Later, when the UI no longer needs the value:
unsubscribe();
unbind();
```

This binds to the `power` status variable on the 3rd `TestModule` in the system `sys-death-star`.
Any changes to the value of `power` on PlaceOS will then be emitted to the function passed to `subscribe`.

Realtime values are exposed as signals. A signal is a callable value holder with a `value` property and a `subscribe` method.

```typescript
import { listen } from '@placeos/ts-client';

const power = listen<boolean>({
    sys: 'sys-death-star',
    mod: 'TestModule',
    index: 3,
    name: 'power',
});

console.log(power.value); // Current value
console.log(power()); // Same current value

const unsubscribe = power.subscribe((value, previous) => {
    console.log('Power changed from', previous, 'to', value);
});
```

Other than listening to changes of values you can also remotely execute methods on modules.

```typescript
const my_mod = getModule('sys-death-star', 'DemoModule', 2);

try {
    const resp = await my_mod.execute('power_off');
    handleSuccess(resp);
} catch (err) {
    handleError(err);
}
```

This will execute the method `power_off` on the 2nd `DemoModule` in the system `sys-death-star`.
If the method doesn't exist or the system is turned off it will return an error.
The response from PlaceOS can be handled using the promise returned by the `execute` method.

### HTTP API

For the HTTP API, `PlaceOS` provides various methods for each of the root endpoints available on PlaceOS's RESTful API.

Docs for the API can be found here https://docs.placeos.com/api/control

Methods are provided for `brokers`, `drivers`, `metadata`, `modules`, `repositories`, `settings`, `systems`, `triggers`, `users`, and `zones`.

```typescript
// Drivers CRUD
const new_driver = await addDriver(driver_data);
const driver = await showDriver(driver_id);
const updated_driver = await updateDriver(driver_id, driver_data);
await removeDriver(driver_id);

// Modules CRUD
const new_module = await addModule(module_data);
const mod = await showModule(module_id);
const updated_module = await updateModule(module_id, module_data);
await removeModule(module_id);

// Systems CRUD
const new_system = await addSystem(system_data);
const system = await showSystem(system_id);
const updated_system = await updateSystem(system_id, system_data);
await removeSystem(system_id);

// Users CRUD
const new_user = await addUser(user_data);
const user = await showUser(user_id);
const updated_user = await updateUser(user_id, user_data);
await removeUser(user_id);

// Zones CRUD
const new_zone = await addZone(zone_data);
const zone = await showZone(zone_id);
const updated_zone = await updateZone(zone_id, zone_data);
await removeZone(zone_id);
```

The lower-level HTTP helpers are promise-based too.

```typescript
import { get, post, del } from '@placeos/ts-client';

const system = await get(`/api/engine/v2/systems/${system_id}`);
const created = await post('/api/engine/v2/zones', zone_data);
await del(`/api/engine/v2/zones/${zone_id}`);
```

The modules also provide methods for the various item action endpoints

```typescript
// Driver Actions
await reloadDriver(driver_id);

// Module Actions
await startModule(module_id);
await stopModule(module_id);
await pingModule(module_id);
await lookupModuleState(module_id, lookup);
await moduleState(module_id);

// System Actions
await addSystemModule(system_id, module_name);
await removeSystemModule(system_id, module_name);
await startSystem(system_id);
await stopSystem(system_id);
await executeOnSystem(system_id, module_name, index, args);
await lookupSystemModuleState(system_id, module_name, index, lookup);
await functionList(system_id, module_name, index);
await moduleTypes(system_id, module_name);
await moduleCount(system_id);
await listSystemZones(system_id);

// User Actions
await currentUser();
```

Objects returned by `show` and `query` methods are immutable.
Therefore to change items you'll need to create a new object to store the changes.

```typescript
showZone(zone_id).then((zone) => {
    console.log(zone.description); // Some Description
    const zone_edited = new PlaceZone({
        ...zone,
        description: 'New description',
    });
    updateZone(zone_edited.id, zone_edited).then((updated_zone) => {
        console.log(updated_zone.description); // New description
    });
});
```

You can find more details about endpoint action on the API docs

https://placeos.docs.apiary.io/

## Migrating from RxJS

The client no longer depends on RxJS. HTTP and resource methods now return promises, while realtime and authentication state methods return signals.

### HTTP and resource requests

Replace observable subscriptions with `await` or promise handlers.

```typescript
// Before
showDriver(driver_id).subscribe((driver) => doSomething(driver));

// After
const driver = await showDriver(driver_id);
doSomething(driver);
```

```typescript
// Before
querySystems({ limit: 20 }).subscribe(({ data }) => render(data));

// After
const { data } = await querySystems({ limit: 20 });
render(data);
```

For error handling, use `try`/`catch` or `.catch`.

```typescript
try {
    await updateZone(zone_id, zone_data);
} catch (error) {
    handleError(error);
}
```

### Realtime values

Realtime listeners now return signals instead of observables. A signal:

- can be called to read its current value: `signal()`
- exposes the same current value as `signal.value`
- emits changes with `signal.subscribe((value, previous) => {})`
- returns an unsubscribe function from `subscribe`
- emits the current value immediately by default

```typescript
// Before
const sub = listen(binding).subscribe((value) => render(value));
sub.unsubscribe();

// After
const signal = listen(binding);
render(signal.value);

const unsubscribe = signal.subscribe((value, previous) => {
    render(value);
});
unsubscribe();
```

If you do not want the initial value to emit on subscription, pass `{ emitCurrent: false }`.

```typescript
const unsubscribe = signal.subscribe((value) => render(value), {
    emitCurrent: false,
});
```

The same pattern applies to realtime status helpers.

```typescript
const unsubscribe = status().subscribe((connected) => {
    renderConnectionState(connected);
});
```

### Auth state

`listenForToken()` and `onlineState()` now return signals.

```typescript
const stopListening = onlineState().subscribe((online) => {
    renderOnlineState(online);
});
```

### Common replacements

| Old RxJS pattern                     | New API                                                               |
| ------------------------------------ | --------------------------------------------------------------------- |
| `await firstValueFrom(showZone(id))` | `await showZone(id)`                                                  |
| `showZone(id).toPromise()`           | `showZone(id)`                                                        |
| `showZone(id).subscribe(fn)`         | `showZone(id).then(fn)` or `const zone = await showZone(id)`          |
| `listen(binding).pipe(...)`          | `listen(binding).subscribe(...)` and handle filtering in the callback |
| `subscription.unsubscribe()`         | `unsubscribe()`                                                       |

## Writing mocks

If you don't have access to a PlaceOS server you can also write mocks so that you can still develop interfaces for PlaceOS.

To use the mock services you can pass `mock: true` into the initialisation object.

### Websockets

To write mocks for the the realtime(websocket) API you'll need to register your systems with the `registerSystem` before attempting to bind to the modules it contains.

```typescript
import { registerSystem } from '@placeos/ts-client';

registerSystem('my-system', {
    MyModule: [
        {
            power: true,
            $power_on: function () {
                this.power = true;
            },
            $power_off: function () {
                this.power = false;
            },
        },
    ],
});
```

Note that executable methods on mock systems are namespaced with `$` as real systems in PlaceOS allow for methods to have the same name as variables.

Once initialised interactions with a system are performed in the same manner as the live system.

```typescript
const my_mod = getModule('my-system', 'MyModule', 1);
const my_variable = my_mod.variable('power');
const unbind = my_variable.bind();
const unsubscribe = my_variable.subscribe((value) => doSomething(value)); // Emits true
await my_mod.execute('power_off'); // The listen callback will now emit false
```

Some methods may need access to other modules within the system, for this a property is appended on runtime called `_system` which allows for access to the parent system

```typescript
registerSystem('my-system', {
    "MyModule": [
        {
            $lights_off: function () { this._system.MyOtherModule[0].lights = false; }
        }
    ]
    "MyOtherModule": [
        {
            lights: true,
        }
    ]
});
```

### HTTP Requests

HTTP API Requests can be mocked in a similar way to the realtime API by registering handlers with `registerMockEndpoint`

```typescript
import { registerMockEndpoint } from '@placeos/ts-client';

registerMockEndpoint({
    path: '/api/engine/v2/systems',
    metadata: {},
    method: 'GET',
    callback: (request) => my_mock_systems,
});
```

Paths allow for route parameters and will pass the value in the callback input.

```typescript
registerMockEndpoint({
    path: '/api/engine/v2/systems/:system_id',
    ...
    callback: (request) =>
        my_mock_systems.find(sys => sys.id === request.route_params.system_id)
});
```

Handlers may also throw errors

```typescript
registerMockEndpoint({
    path: `/api/engin/v2/systems/:id`,
    method: 'GET',
    callback: (request) => {
        if (request.route_params.id) {
            ...
        }
        throw { status: 404, message: 'Invalid system ID' };
    }
});
```

Query parameters are also available on the callback input.

`GET`, `POST`, `PUT`, `PATCH` and `DELETE` requests can be mocked out.

Mock HTTP handlers return promises. If a request is made and there are no handlers it will attempt to make the live request.

### Authentication

Authentication is handled automatically by the library but can be configured with the `setup` configuration.

If you wish to handle login within your application you can set `handle_login` to `false` to prevent redirecting to the login URL set in the `authority`.  
If you wish to prevent redirecting the application to handle application authentication you can set `use_iframe` to `true` to have that handled in the background.

![Authentication Flowchart](https://aca.im/cdn/images/auth-flowchart.png)

## Usage with Node JS

It is possible to use `ts-client` with Node JS.
It requires an addition setup step before the library can be used loading the library.

### Javascript:

```javascript
const ts_client = require('@placeos/ts-client');

async function setupPlaceOS() {
    await ts_client.preSetupNode();
    await ts_client.setup({
        ...
    })
}
```

### Typescript:

```typescript
import { preSetupNode, setup } from '@placeos/ts-client';

async function setupPlaceOS() {
    await preSetupNode();
    await setup({
        ...
    })
}
```
