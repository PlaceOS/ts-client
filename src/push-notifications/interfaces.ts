export interface MicrosoftNotification {
    validationTokens?: string[];
    value: MicrosoftNotificationValue[];
}

export interface MicrosoftNotificationValue {
    changeType?: 'created' | 'updated' | 'deleted';
    clientState?: string;
    encryptedContent?: MicrosoftNotificationEncryptedContent;
    id?: string;
    lifecycleEvent?:
        | 'missed'
        | 'subscription_removed'
        | 'reauthorization_required'
        | 'unexpected_value';
    resource?: string;
    resourceData?: { id?: string };
    subscriptionExpirationDateTime: string;
    subscriptionId: string;
    tenantId: string;
}

export interface MicrosoftNotificationEncryptedContent {
    data?: string;
    dataKey?: string;
    dataSignature?: string;
    encryptionCertificateId?: string;
    encryptionCertificateThumbprint?: string;
}
