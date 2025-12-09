/* istanbul ignore file */

export { del, get, patch, post, put, responseHeaders } from './http/functions';
export type {
    HttpError,
    HttpJsonOptions,
    HttpOptions,
    HttpResponse,
    HttpResponseType,
    MockHttpRequest,
    MockHttpRequestHandler,
    MockHttpRequestHandlerOptions,
} from './http/interfaces';
export {
    deregisterMockEndpoint,
    registerMockEndpoint,
    setMockNotFoundHandler,
} from './http/mock';

export { PlaceAlert } from './alerts/alert';
export { PlaceAlertDashboard } from './alerts/dashboard';
export {
    addAlert,
    addAlertDashboard,
    listDashboardAlerts,
    queryAlertDashboards,
    queryAlerts,
    removeAlert,
    removeAlertDashboard,
    showAlert,
    showAlertDashboard,
    updateAlert,
    updateAlertDashboard,
} from './alerts/functions';
export type {
    PlaceAlertDashboardQueryOptions,
    PlaceAlertQueryOptions,
    PlaceAlertShowOptions,
} from './alerts/interfaces';

export { PlaceApplication } from './applications/application';
export {
    addApplication,
    queryApplications,
    removeApplication,
    showApplication,
    updateApplication,
} from './applications/functions';
export type { PlaceApplicationQueryOptions } from './applications/interfaces';

export type { PlaceAuthSourceQueryOptions } from './auth-sources/interfaces';

export { AuthType, PlaceMQTTBroker } from './broker/broker';
export {
    addBroker,
    queryBrokers,
    removeBroker,
    showBroker,
    updateBroker,
} from './broker/functions';

export { PlaceCluster } from './clusters/cluster';
export {
    queryClusters,
    queryProcesses,
    showCluster,
    terminateProcess,
} from './clusters/functions';
export type {
    PlaceClusterQueryOptions,
    PlaceClusterShowOptions,
    PlaceClusterTerminateOptions,
} from './clusters/interfaces';
export { PlaceProcess } from './clusters/process';

export { PlaceDomain } from './domains/domain';
export {
    addDomain,
    queryDomains,
    removeDomain,
    showDomain,
    updateDomain,
} from './domains/functions';

export { PlaceDriver } from './drivers/driver';
export { PlaceDriverRole } from './drivers/enums';
export {
    addDriver,
    driverReadme,
    isDriverCompiled,
    queryDrivers,
    recompileDriver,
    reloadDriver,
    removeDriver,
    showDriver,
    updateDriver,
} from './drivers/functions';
export type {
    PlaceDriverDetails,
    PlaceDriverQueryOptions,
    PlaceDriverShowOptions,
} from './drivers/interfaces';

export { PlaceEdge } from './edge/edge';
export {
    addEdge,
    queryEdges,
    removeEdge,
    retrieveEdgeToken,
    showEdge,
    updateEdge,
} from './edge/functions';

export {
    addLDAPSource,
    queryLDAPSources,
    removeLDAPSource,
    showLDAPSource,
    updateLDAPSource,
} from './ldap-sources/functions';
export { PlaceLDAPSource } from './ldap-sources/ldap-source';

export {
    addMetadata,
    listChildMetadata,
    listMetadata,
    listMetadataHistory,
    removeMetadata,
    showMetadata,
    updateMetadata,
} from './metadata/functions';
export type {
    PlaceMetadataDeleteOptions,
    PlaceMetadataHistoryOptions,
    PlaceMetadataOptions,
    PlaceZoneMetadataOptions,
} from './metadata/interfaces';
export { PlaceMetadata } from './metadata/metadata';
export { PlaceZoneMetadata } from './metadata/zone-metadata';

export {
    addModule,
    loadModule,
    lookupModuleState,
    moduleRuntimeError,
    moduleSettings,
    moduleState,
    queryModules,
    removeModule,
    showModule,
    startModule,
    stopModule,
    updateModule,
} from './modules/functions';
export type {
    PlaceModulePingOptions,
    PlaceModuleQueryOptions,
    PlaceModuleShowOptions,
} from './modules/interfaces';
export { PlaceModule } from './modules/module';

export {
    addOAuthSource,
    queryOAuthSources,
    removeOAuthSource,
    showOAuthSource,
    updateOAuthSource,
} from './oauth-sources/functions';
export { PlaceOAuthSource } from './oauth-sources/oauth-source';

export {
    addRepository,
    listInterfaceRepositories,
    listRemoteRepositoryBranches,
    listRemoteRepositoryCommits,
    listRemoteRepositoryDefaultBranch,
    listRepositoryBranches,
    listRepositoryCommits,
    listRepositoryDefaultBranch,
    listRepositoryDriverDetails,
    listRepositoryDrivers,
    pullRepositoryChanges,
    queryRepositories,
    removeRepository,
    showRepository,
    updateRepository,
} from './repositories/functions';
export { PlaceRepositoryType } from './repositories/interfaces';
export type {
    GitCommitDetails,
    PlaceRemoteRepositoryCommitsQuery,
    PlaceRemoteRepositoryQuery,
    PlaceRepositoryCommit,
    PlaceRepositoryCommitQuery,
    PlaceRepositoryDetailsQuery,
    PlaceRepositoryFoldersQuery,
    PlaceRepositoryPullQuery,
    PlaceRepositoryQueryOptions,
} from './repositories/interfaces';
export { PlaceRepository } from './repositories/repository';

export {
    create,
    lastRequestTotal,
    query,
    remove,
    requestTotal,
    show,
    update,
    type QueryResponse,
} from './resources/functions';
export type { PlaceResourceQueryOptions } from './resources/interface';
export { PlaceResource } from './resources/resource';

export {
    addSAMLSource,
    querySAMLSources,
    removeSAMLSource,
    showSAMLSource,
    updateSAMLSource,
} from './saml-sources/functions';
export { PlaceSAMLSource } from './saml-sources/saml-source';
export type { PlaceSamlRequestAttribute } from './saml-sources/saml-source';

export {
    addSettings,
    querySettings,
    removeSettings,
    settingsHistory,
    showSettings,
    updateSettings,
} from './settings/functions';
export { EncryptionLevel } from './settings/interfaces';
export type {
    PlaceSettingsHistoryOptions,
    PlaceSettingsQueryOptions,
} from './settings/interfaces';
export { PlaceSettings } from './settings/settings';

export {
    addSystem,
    addSystemModule,
    addSystemTrigger,
    executeOnSystem,
    functionList,
    listSystemTriggers,
    listSystemZones,
    lookupSystemModuleState,
    querySystems,
    querySystemsWithEmails,
    removeSystem,
    removeSystemModule,
    removeSystemTrigger,
    showSystem,
    startSystem,
    stopSystem,
    systemModuleState,
    systemSettings,
    updateSystem,
} from './systems/functions';
export type {
    PlaceModuleFunction,
    PlaceModuleFunctionMap,
    PlaceSystemShowOptions,
    PlaceSystemStartStopOptions,
    PlaceSystemTriggersQueryOptions,
    PlaceSystemUpdateOptions,
    PlaceSystemsQueryOptions,
    PlaceSystemsWithEmailsOptions,
} from './systems/interfaces';
export { PlaceSystem } from './systems/system';

export {
    addTrigger,
    listTriggerInstances,
    queryTriggers,
    removeTrigger,
    showTrigger,
    updateTrigger,
} from './triggers/functions';
export {
    TriggerConditionOperator,
    TriggerTimeConditionType,
    TriggerWebhookType,
} from './triggers/interfaces';
export type {
    ExecuteArgs,
    PlaceTriggerQueryOptions,
    PlaceTriggerShowOptions,
    TriggerActions,
    TriggerAtTimeCondition,
    TriggerComparison,
    TriggerConditionConstant,
    TriggerConditionValue,
    TriggerConditions,
    TriggerCronTimeCondition,
    TriggerFunction,
    TriggerMailer,
    TriggerStatusVariable,
    TriggerTimeCondition,
    TriggerWebhook,
} from './triggers/interfaces';
export { PlaceTrigger } from './triggers/trigger';

export {
    addUser,
    currentUser,
    queryUsers,
    removeUser,
    showUser,
    updateUser,
} from './users/functions';
export type {
    PlaceUserDeleteOptions,
    PlaceUserQueryOptions,
    PlaceUserShowOptions,
} from './users/interfaces';
export { PlaceUser } from './users/user';
export type { WorktimePreference } from './users/user';

export {
    addZone,
    executeOnZone,
    listZoneTags,
    listZoneTriggers,
    queryZones,
    removeZone,
    showZone,
    updateZone,
} from './zones/functions';
export type {
    PlaceZoneMetadataQueryOptions,
    PlaceZoneQueryOptions,
    PlaceZoneShowOptions,
} from './zones/interfaces';
export { PlaceZone } from './zones/zone';

export {
    addSignageMedia,
    addSignagePlaylist,
    approveSignagePlaylist,
    listSignagePlaylistMedia,
    listSignagePlaylistMediaRevisions,
    querySignageMedia,
    querySignagePlaylists,
    removeSignageMedia,
    removeSignagePlaylist,
    showSignage,
    showSignageMedia,
    showSignageMetrics,
    showSignagePlaylist,
    updateSignageMedia,
    updateSignagePlaylist,
    updateSignagePlaylistMedia,
} from './signage/functions';
export type {
    SignageMediaQueryOptions,
    SignageMetrics,
    SignagePlaylistQueryOptions,
    SignagePlaylistRevisionsOptions,
} from './signage/interfaces';
export {
    MediaAnimation,
    SignageMedia,
    type MediaOrientation,
} from './signage/media.class';
export {
    SignagePlaylist,
    SignagePlaylistMedia,
} from './signage/playlist.class';

export { addAnswer, queryAnswers } from './staff/answers/functions';
export type { AnswerQueryOptions } from './staff/answers/interfaces';
export { SurveyAnswer } from './staff/answers/model';

export {
    addInvitation,
    queryInvitations,
    removeInvitation,
    showInvitation,
    updateInvitation,
} from './staff/invitations/functions';
export type {
    InvitationQueryOptions,
    InvitationShowOptions,
} from './staff/invitations/interfaces';
export { SurveyInvitation } from './staff/invitations/model';

export {
    addQuestion,
    queryQuestions,
    removeQuestion,
    showQuestion,
    updateQuestion,
} from './staff/questions/functions';
export type {
    QuestionQueryOptions,
    QuestionShowOptions,
} from './staff/questions/interfaces';
export { SurveyQuestion } from './staff/questions/model';

export {
    addSurvey,
    querySurveys,
    removeSurvey,
    showSurvey,
    updateSurvey,
} from './staff/surveys/functions';
export type {
    SurveyQueryOptions,
    SurveyShowOptions,
} from './staff/surveys/interfaces';
export { Survey, type SurveyPage } from './staff/surveys/model';

export {
    PlaceAsset,
    PlaceAssetCategory,
    PlaceAssetPurchaseOrder,
    PlaceAssetType,
} from './assets/assets.class';
export {
    addAsset,
    addAssetCategory,
    addAssetPurchaseOrder,
    addAssetType,
    addAssets,
    queryAssetCategories,
    queryAssetPurchaseOrders,
    queryAssetTypes,
    queryAssets,
    removeAsset,
    removeAssetCategory,
    removeAssetPurchaseOrder,
    removeAssetType,
    removeAssets,
    showAsset,
    showAssetCategory,
    showAssetPurchaseOrder,
    showAssetType,
    updateAsset,
    updateAssetCategory,
    updateAssetPurchaseOrder,
    updateAssetType,
    updateAssets,
} from './assets/functions';
export type {
    PlaceAssetCategoryQueryOptions,
    PlaceAssetPurchaseOrderQueryOptions,
    PlaceAssetQueryOptions,
    PlaceAssetTypeQueryOptions,
} from './assets/interfaces';

export { PlaceShortUrl } from './short-url/short-url.class';
export {
    addShortUrl,
    generateQrCode,
    getShortUrlQrCodeSvg,
    qrCodeUrl,
    queryShortUrls,
    removeShortUrl,
    shortUrlQrCodePngUrl,
    shortUrlRedirectUrl,
    showShortUrl,
    updateShortUrl,
} from './short-url/functions';
export type {
    PlaceQrCodeOptions,
    PlaceShortUrlPngQrOptions,
    PlaceShortUrlQueryOptions,
    QrCodeFormat,
} from './short-url/interfaces';

export { PlaceStorage, type StorageType } from './storages/storage.class';
export {
    addStorage,
    queryStorages,
    removeStorage,
    showStorage,
    updateStorage,
} from './storages/functions';
export type { PlaceStorageQueryOptions } from './storages/interfaces';

export {
    queryWebrtcRooms,
    showWebrtcRoom,
    webrtcGuestEntry,
    webrtcGuestExit,
    webrtcKickUser,
    webrtcSessionMembers,
    webrtcSignallerUrl,
    webrtcTransferUser,
} from './webrtc/functions';
export type {
    PlaceGuestParticipant,
    PlaceKickReason,
    PlaceWebrtcMember,
    PlaceWebrtcRoomDetails,
    PlaceWebrtcRoomsQueryOptions,
} from './webrtc/interfaces';
