/* istanbul ignore file */
export class AbortControllerStub {
    public abort() {}
}

if (!globalThis.AbortController) {
    (globalThis as any).AbortController = AbortControllerStub;
}
