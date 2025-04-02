import dotenv from 'dotenv';
import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { encrypt, decrypt, broken_decrypt } from './utils/encryption';
import messageService from './services/messageService';
import { EncryptedMessage, DecryptedMessage, DebugResponse, ErrorResponse } from './types';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Input validation middleware
const validateUserId = (req: Request, res: Response, next: NextFunction): void => {
    const userId = req.params.userId || req.body.userId;
    if (!userId || typeof userId !== 'string' || userId.length < 1) {
        res.status(400).json({ error: 'Invalid user ID' });
        return;
    }
    next();
};

// Routes
app.post('/messages', validateUserId, (req: Request, res: Response) => {
    try {
        const { userId, message } = req.body;
        
        if (!message || typeof message !== 'string') {
            res.status(400).json({ error: 'Invalid message' });
            return;
        }

        const encryptedMessage = encrypt(message, userId);
        const storedMessage = messageService.storeMessage(userId, message, encryptedMessage);

        const response: EncryptedMessage = {
            messageId: storedMessage.id,
            encryptedMessage: storedMessage.message
        };

        res.json(response);
    } catch (error) {
        res.status(500).json({ error: 'Failed to encrypt message' });
    }
});

app.get('/messages/:userId', validateUserId, (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const messages = messageService.getMessages(userId);

        const decryptedMessages: DecryptedMessage[] = messages.map(msg => ({
            messageId: msg.id,
            message: decrypt(msg.message, userId),
            timestamp: msg.timestamp
        }));

        res.json({ messages: decryptedMessages });
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve messages' });
    }
});

app.post('/debug/decrypt', (req: Request, res: Response) => {
    try {
        const { encryptedMessage, userId } = req.body;

        if (!encryptedMessage || !userId) {
            res.status(400).json({ error: 'Missing required parameters' });
            return;
        }

        // First try the broken decryption
        let brokenResult: string;
        try {
            brokenResult = broken_decrypt(encryptedMessage, userId);
        } catch (error) {
            brokenResult = 'Decryption failed: ' + (error as Error).message;
        }

        // Then try the correct decryption
        let correctResult: string;
        try {
            correctResult = decrypt(encryptedMessage, userId);
        } catch (error) {
            correctResult = 'Decryption failed: ' + (error as Error).message;
        }

        const response: DebugResponse = {
            brokenResult,
            correctResult,
            explanation: `The broken decryption function fails because it doesn't handle the authentication tag correctly. 
                         The correct implementation properly extracts and uses the auth tag from the encrypted message.`
        };

        res.json(response);
    } catch (error) {
        res.status(500).json({ error: 'Debug endpoint failed' });
    }
});

// Add health check endpoint
app.get('/messages/health', (req: Request, res: Response) => {
    res.json({ status: 'ok' });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction): void => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
}); 