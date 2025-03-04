/* istanbul ignore file */

export {
    apiEndpoint,
    apiKey,
    authorise,
    authority,
    cleanupAuth,
    clientId,
    hasToken,
    host,
    httpRoute,
    invalidateToken,
    isFixedDevice,
    isMock,
    isOnline,
    isSecure,
    isTrusted,
    listenForToken,
    logout,
    onlineState,
    redirectUri,
    refreshAuthority,
    refreshToken,
    setAPI_Key,
    setToken,
    setup,
    token,
} from './auth/functions';
export type {
    PlaceAuthOptions,
    PlaceAuthority,
    PlaceTokenResponse,
} from './auth/interfaces';
