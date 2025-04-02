# Secure Messaging API

A secure messaging backend implementation with AES encryption and user-specific message storage.

## Design Decisions

### Encryption Method and Mode
- **Algorithm**: AES-256-GCM (Galois/Counter Mode)
- **Key Size**: 256 bits
- **IV Size**: 12 bytes (96 bits)
- **Authentication Tag**: 16 bytes (128 bits)

**Why AES-256-GCM?**
- GCM provides both confidentiality and authenticity
- Prevents tampering with messages
- Industry standard for secure communication
- Built-in authentication tag prevents padding oracle attacks

### User Access Control
1. Each message is encrypted with a user-specific key derived from their user ID
2. Messages are stored with user ID as part of the key
3. Rate limiting prevents brute force attempts
4. Input validation ensures proper user ID format

### IV Storage and Extraction
- IV is prepended to the encrypted message
- Format: `[IV (12 bytes)][Auth Tag (16 bytes)][Encrypted Message]`
- Base64 encoded for safe transmission
- IV is randomly generated for each message

### Preventing User ID Spoofing
1. Input validation and sanitization
2. Rate limiting per IP address
3. Message ownership verification
4. Secure key derivation using HMAC-SHA256
5. Helmet.js for security headers

## API Endpoints

### POST /messages
Store an encrypted message for a user.

Request:
```json
{
  "userId": "string",
  "message": "string"
}
```

Response:
```json
{
  "messageId": "string",
  "encryptedMessage": "base64 string"
}
```

### GET /messages/:userId
Retrieve all messages for a user.

Response:
```json
{
  "messages": [
    {
      "messageId": "string",
      "message": "decrypted string",
      "timestamp": "ISO date string"
    }
  ]
}
```

### POST /debug/decrypt
Debug endpoint for fixing the broken decryption function.

## Security Features
- AES-256-GCM encryption
- Random IV per message
- Message authentication
- Rate limiting
- Security headers
- Input validation
- Error handling

## Running the Application

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

3. Run tests:
```bash
npm test
```

## Environment Variables
Create a `.env` file with:
```
PORT=3000
NODE_ENV=development
``` 