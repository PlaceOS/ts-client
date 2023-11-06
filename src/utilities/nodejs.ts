const store: Record<string, string> = {};

/** istanbul ignore */
export async function preSetupNode() {
    const global_space: any = global;
    global_space.debug = true;
    global_space.document = {};
    global_space.navigator = {};
    global_space.webSocket = (await import('websocket' as any)).w3cwebsocket;
    global_space.fetch = await import('node-fetch' as any);
    global_space.localStorage = (globalThis as any).sessionStorage = {
        getItem: (s: any) => store[s],
        setItem: (s: any, v: any) => (store[s] = v),
        removeItem: (s: any) => delete store[s],
        length: 0,
        keys: () => Object.keys(store),
    };
    (globalThis as any).window = globalThis;
}
