/* istanbul ignore file */

export { get, post, put, patch, del, responseHeaders } from './http/functions';
export type {
    HttpError,
    HttpOptions,
    HttpJsonOptions,
    HttpResponse,
    HttpResponseType,
    MockHttpRequest,
    MockHttpRequestHandler,
    MockHttpRequestHandlerOptions,
} from './http/interfaces';
export { registerMockEndpoint, deregisterMockEndpoint } from './http/mock';

export {
    queryApplications,
    showApplication,
    addApplication,
    updateApplication,
    removeApplication,
} from './applications/functions';
export { PlaceApplication } from './applications/application';
export type { PlaceApplicationQueryOptions } from './applications/interfaces';
export type { PlaceAuthSourceQueryOptions } from './auth-sources/interfaces';

export { PlaceMQTTBroker, AuthType } from './broker/broker';
export {
    queryBrokers,
    showBroker,
    addBroker,
    updateBroker,
    removeBroker,
} from './broker/functions';

export {
    queryClusters,
    queryProcesses,
    terminateProcess,
} from './clusters/functions';
export { PlaceCluster } from './clusters/cluster';
export { PlaceProcess } from './clusters/process';
export type { PlaceClusterQueryOptions } from './clusters/interfaces';

export {
    queryDomains,
    showDomain,
    addDomain,
    updateDomain,
    removeDomain,
} from './domains/functions';
export { PlaceDomain } from './domains/domain';

export {
    queryDrivers,
    showDriver,
    addDriver,
    updateDriver,
    removeDriver,
    recompileDriver,
    reloadDriver,
    isDriverCompiled,
} from './drivers/functions';
export { PlaceDriver } from './drivers/driver';
export type {
    PlaceDriverQueryOptions,
    PlaceDriverDetails,
} from './drivers/interfaces';
export { PlaceDriverRole } from './drivers/enums';

export { PlaceEdge } from './edge/edge';
export {
    queryEdges,
    showEdge,
    addEdge,
    updateEdge,
    removeEdge,
    retrieveEdgeToken,
} from './edge/functions';

export {
    queryLDAPSources,
    showLDAPSource,
    addLDAPSource,
    updateLDAPSource,
    removeLDAPSource,
} from './ldap-sources/functions';
export { PlaceLDAPSource } from './ldap-sources/ldap-source';

export {
    listMetadata,
    showMetadata,
    updateMetadata,
    addMetadata,
    removeMetadata,
    listChildMetadata,
    listMetadataHistory,
} from './metadata/functions';
export { PlaceMetadata } from './metadata/metadata';
export type {
    PlaceMetadataOptions,
    PlaceZoneMetadataOptions,
} from './metadata/interfaces';
export { PlaceZoneMetadata } from './metadata/zone-metadata';

export {
    queryModules,
    showModule,
    addModule,
    updateModule,
    removeModule,
    startModule,
    stopModule,
    moduleState,
    moduleSettings,
    lookupModuleState,
    loadModule,
    moduleRuntimeError,
} from './modules/functions';
export { PlaceModule } from './modules/module';
export type {
    PlaceModuleQueryOptions,
    PlaceModulePingOptions,
} from './modules/interfaces';

export {
    queryOAuthSources,
    showOAuthSource,
    addOAuthSource,
    updateOAuthSource,
    removeOAuthSource,
} from './oauth-sources/functions';
export { PlaceOAuthSource } from './oauth-sources/oauth-source';

export {
    queryRepositories,
    showRepository,
    addRepository,
    updateRepository,
    removeRepository,
    listInterfaceRepositories,
    listRepositoryBranches,
    listRepositoryCommits,
    listRepositoryDriverDetails,
    listRepositoryDrivers,
    pullRepositoryChanges,
} from './repositories/functions';
export { PlaceRepository } from './repositories/repository';
export { PlaceRepositoryType } from './repositories/interfaces';
export type {
    PlaceRepositoryCommitQuery,
    GitCommitDetails,
    PlaceRepositoryDetailsQuery,
    PlaceRepositoryPullQuery,
    PlaceRepositoryCommit,
} from './repositories/interfaces';

export {
    query,
    show,
    create,
    update,
    remove,
    requestTotal,
    lastRequestTotal,
} from './resources/functions';

export {
    querySAMLSources,
    showSAMLSource,
    addSAMLSource,
    updateSAMLSource,
    removeSAMLSource,
} from './saml-sources/functions';
export { PlaceSAMLSource } from './saml-sources/saml-source';
export type { PlaceSamlRequestAttribute } from './saml-sources/saml-source';

export {
    querySettings,
    showSettings,
    addSettings,
    updateSettings,
    removeSettings,
    settingsHistory,
} from './settings/functions';
export { PlaceSettings } from './settings/settings';
export { EncryptionLevel } from './settings/interfaces';
export type { PlaceSettingsQueryOptions } from './settings/interfaces';

export {
    querySystems,
    querySystemsWithEmails,
    showSystem,
    addSystem,
    updateSystem,
    removeSystem,
    addSystemModule,
    addSystemTrigger,
    removeSystemModule,
    removeSystemTrigger,
    startSystem,
    stopSystem,
    systemModuleState,
    systemSettings,
    listSystemTriggers,
    listSystemZones,
    lookupSystemModuleState,
    executeOnSystem,
    functionList,
} from './systems/functions';
export { PlaceSystem } from './systems/system';
export type {
    PlaceModuleFunctionMap,
    PlaceModuleFunction,
    PlaceSystemsQueryOptions,
    PlaceSystemShowOptions,
} from './systems/interfaces';

export {
    queryTriggers,
    showTrigger,
    addTrigger,
    updateTrigger,
    removeTrigger,
    listTriggerInstances,
} from './triggers/functions';
export { PlaceTrigger } from './triggers/trigger';
export {
    TriggerConditionOperator,
    TriggerTimeConditionType,
    TriggerWebhookType,
} from './triggers/interfaces';
export type {
    TriggerActions,
    TriggerMailer,
    TriggerFunction,
    ExecuteArgs,
    TriggerConditions,
    TriggerComparison,
    TriggerConditionValue,
    TriggerConditionConstant,
    TriggerStatusVariable,
    TriggerTimeCondition,
    TriggerAtTimeCondition,
    TriggerCronTimeCondition,
    TriggerWebhook,
} from './triggers/interfaces';

export {
    queryUsers,
    showUser,
    addUser,
    updateUser,
    removeUser,
    currentUser,
} from './users/functions';
export { PlaceUser } from './users/user';
export type { WorktimePreference } from './users/user';
export type { PlaceUserQueryOptions } from './users/interfaces';

export {
    queryZones,
    showZone,
    addZone,
    updateZone,
    removeZone,
    listZoneTriggers,
    executeOnZone,
} from './zones/functions';
export { PlaceZone } from './zones/zone';
export type {
    PlaceZoneQueryOptions,
    PlaceZoneShowOptions,
} from './zones/interfaces';

export {
    showSignage,
    showSignageMetrics,
    querySignageMedia,
    showSignageMedia,
    updateSignageMedia,
    addSignageMedia,
    removeSignageMedia,
    querySignagePlaylists,
    showSignagePlaylist,
    updateSignagePlaylist,
    addSignagePlaylist,
    removeSignagePlaylist,
    listSignagePlaylistMediaRevisions,
    listSignagePlaylistMedia,
    updateSignagePlaylistMedia,
} from './signage/functions';
export { SignageMedia, MediaAnimation } from './signage/media.class';
export {
    SignagePlaylist,
    SignagePlaylistMedia,
} from './signage/playlist.class';
export type {
    SignageMediaQueryOptions,
    SignageMetrics,
} from './signage/interfaces';
