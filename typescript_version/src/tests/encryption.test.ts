/// <reference types="jest" />
import { encrypt, decrypt, broken_decrypt } from '../utils/encryption';

describe('Encryption Tests', () => {
    const testMessage = 'Hello, World!';
    const testUserId = 'test-user-123';

    test('encrypt and decrypt should work correctly', () => {
        const encrypted = encrypt(testMessage, testUserId);
        const decrypted = decrypt(encrypted, testUserId);

        expect(decrypted).toBe(testMessage);
        expect(encrypted).not.toBe(testMessage);
        expect(encrypted).toMatch(/^[A-Za-z0-9+/=]+$/); // Base64 format
    });

    test('broken_decrypt should fail with authentication error', () => {
        const encrypted = encrypt(testMessage, testUserId);
        
        expect(() => {
            broken_decrypt(encrypted, testUserId);
        }).toThrow();
    });

    test('decrypt should fail with wrong user ID', () => {
        const encrypted = encrypt(testMessage, testUserId);
        
        expect(() => {
            decrypt(encrypted, 'wrong-user');
        }).toThrow('Decryption failed');
    });

    test('encryption should produce different results for same message', () => {
        const encrypted1 = encrypt(testMessage, testUserId);
        const encrypted2 = encrypt(testMessage, testUserId);

        expect(encrypted1).not.toBe(encrypted2); // Different IVs
        expect(decrypt(encrypted1, testUserId)).toBe(testMessage);
        expect(decrypt(encrypted2, testUserId)).toBe(testMessage);
    });
}); 