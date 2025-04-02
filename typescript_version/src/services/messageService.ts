import crypto from 'crypto';
import { Message } from '../types';

// In-memory storage for messages (in production, use a proper database)
const messages = new Map<string, Message[]>();

class MessageService {
    constructor() {
        // Clean up expired messages every minute
        setInterval(this.cleanupExpiredMessages.bind(this), 60000);
    }

    // Store a message for a user
    storeMessage(userId: string, message: string, encryptedMessage: string): Message {
        if (!messages.has(userId)) {
            messages.set(userId, []);
        }

        const messageData: Message = {
            id: crypto.randomBytes(16).toString('hex'),
            message: encryptedMessage,
            timestamp: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes expiry
        };

        messages.get(userId)!.push(messageData);
        return messageData;
    }

    // Get all messages for a user
    getMessages(userId: string): Message[] {
        const userMessages = messages.get(userId) || [];
        return userMessages.filter(msg => !this.isExpired(msg));
    }

    // Check if a message is expired
    private isExpired(message: Message): boolean {
        return new Date(message.expiresAt) < new Date();
    }

    // Clean up expired messages
    private cleanupExpiredMessages(): void {
        for (const [userId, userMessages] of messages.entries()) {
            messages.set(userId, userMessages.filter(msg => !this.isExpired(msg)));
        }
    }
}

export default new MessageService(); 