import crypto from 'crypto';

// Constants for encryption
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;
const KEY_LENGTH = 32; // 256 bits

// Generate a user-specific key from userId
function generateUserKey(userId: string): Buffer {
    // Use HMAC-SHA256 to derive a consistent key from userId
    const hmac = crypto.createHmac('sha256', process.env.ENCRYPTION_SECRET || 'default-secret');
    hmac.update(userId);
    return hmac.digest();
}

// Encrypt a message for a specific user
export function encrypt(message: string, userId: string): string {
    // Generate a random IV
    const iv = crypto.randomBytes(IV_LENGTH);
    
    // Generate user-specific key
    const key = generateUserKey(userId);
    
    // Create cipher
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    // Encrypt the message
    let encrypted = cipher.update(message, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    
    // Get the auth tag
    const authTag = cipher.getAuthTag();
    
    // Combine IV, auth tag, and encrypted message
    const combined = Buffer.concat([iv, authTag, Buffer.from(encrypted, 'base64')]);
    
    return combined.toString('base64');
}

// Decrypt a message for a specific user
export function decrypt(encryptedMessage: string, userId: string): string {
    try {
        // Convert base64 to buffer
        const combined = Buffer.from(encryptedMessage, 'base64');
        
        // Extract IV, auth tag, and encrypted message
        const iv = combined.slice(0, IV_LENGTH);
        const authTag = combined.slice(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
        const encrypted = combined.slice(IV_LENGTH + AUTH_TAG_LENGTH);
        
        // Generate user-specific key
        const key = generateUserKey(userId);
        
        // Create decipher
        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
        decipher.setAuthTag(authTag);
        
        // Decrypt the message
        let decrypted = decipher.update(encrypted);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        
        return decrypted.toString('utf8');
    } catch (error) {
        throw new Error('Decryption failed: Invalid message or wrong user');
    }
}

// Broken decryption function for debugging
export function broken_decrypt(encryptedMessage: string, userId: string): string {
    // Original broken implementation
    const combined = Buffer.from(encryptedMessage, 'base64');
    const iv = combined.slice(0, IV_LENGTH);
    const encrypted = combined.slice(IV_LENGTH);
    const key = generateUserKey(userId);
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    
    return decrypted.toString('utf8');
} 