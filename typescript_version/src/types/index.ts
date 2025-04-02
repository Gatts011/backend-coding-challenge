export interface Message {
    id: string;
    message: string;
    timestamp: string;
    expiresAt: Date;
}

export interface EncryptedMessage {
    messageId: string;
    encryptedMessage: string;
}

export interface DecryptedMessage {
    messageId: string;
    message: string;
    timestamp: string;
}

export interface DebugResponse {
    brokenResult: string;
    correctResult: string;
    explanation: string;
}

export interface ErrorResponse {
    error: string;
} 