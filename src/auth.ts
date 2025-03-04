/* istanbul ignore file */

export {
    apiEndpoint,
    apiKey,
    httpRoute,
    cleanupAuth,
    clientId,
    redirectUri,
    token,
    refreshToken,
    host,
    hasToken,
    authority,
    isOnline,
    isMock,
    isSecure,
    onlineState,
    isTrusted,
    isFixedDevice,
    setup,
    refreshAuthority,
    invalidateToken,
    authorise,
    logout,
    listenForToken,
    setToken,
    setAPI_Key,
} from './auth/functions';
export type {
    PlaceAuthority,
    PlaceAuthOptions,
    PlaceTokenResponse,
} from './auth/interfaces';
