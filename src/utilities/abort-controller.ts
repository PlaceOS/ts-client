/* istanbul ignore file */
export class AbortControllerStub {
    public abort() {}
}

const global_space = window || global;

if (!global_space.AbortController) {
    (global_space as any).AbortController = AbortControllerStub;
}
