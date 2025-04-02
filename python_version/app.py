import os
from flask import Flask, request, jsonify
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from dotenv import load_dotenv
from utils.encryption import encrypt, decrypt, broken_decrypt
from services.message_service import message_service

# Load environment variables
load_dotenv()

app = Flask(__name__)
limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["100 per 15 minutes"]
)

def validate_user_id(user_id: str) -> bool:
    """Validate user ID format."""
    return bool(user_id and isinstance(user_id, str) and len(user_id) > 0)

@app.route('/messages', methods=['POST'])
@limiter.limit("100 per 15 minutes")
def store_message():
    try:
        data = request.get_json()
        user_id = data.get('userId')
        message = data.get('message')

        if not validate_user_id(user_id):
            return jsonify({'error': 'Invalid user ID'}), 400

        if not message or not isinstance(message, str):
            return jsonify({'error': 'Invalid message'}), 400

        encrypted_message = encrypt(message, user_id)
        stored_message = message_service.store_message(user_id, message, encrypted_message)

        return jsonify({
            'messageId': stored_message.id,
            'encryptedMessage': stored_message.message
        })

    except Exception as e:
        return jsonify({'error': 'Failed to encrypt message'}), 500

@app.route('/messages/<user_id>', methods=['GET'])
@limiter.limit("100 per 15 minutes")
def get_messages(user_id):
    try:
        if not validate_user_id(user_id):
            return jsonify({'error': 'Invalid user ID'}), 400

        messages = message_service.get_messages(user_id)
        decrypted_messages = [
            {
                'messageId': msg.id,
                'message': decrypt(msg.message, user_id),
                'timestamp': msg.timestamp
            }
            for msg in messages
        ]

        return jsonify({'messages': decrypted_messages})

    except Exception as e:
        return jsonify({'error': 'Failed to retrieve messages'}), 500

@app.route('/debug/decrypt', methods=['POST'])
@limiter.limit("100 per 15 minutes")
def debug_decrypt():
    try:
        data = request.get_json()
        encrypted_message = data.get('encryptedMessage')
        user_id = data.get('userId')

        if not encrypted_message or not user_id:
            return jsonify({'error': 'Missing required parameters'}), 400

        # Try broken decryption
        try:
            broken_result = broken_decrypt(encrypted_message, user_id)
        except Exception as e:
            broken_result = f'Decryption failed: {str(e)}'

        # Try correct decryption
        try:
            correct_result = decrypt(encrypted_message, user_id)
        except Exception as e:
            correct_result = f'Decryption failed: {str(e)}'

        return jsonify({
            'brokenResult': broken_result,
            'correctResult': correct_result,
            'explanation': "The broken decryption function fails because it doesn't handle the authentication tag correctly. "
                         "The correct implementation properly extracts and uses the auth tag from the encrypted message."
        })

    except Exception as e:
        return jsonify({'error': 'Debug endpoint failed'}), 500

# Add health check endpoint
@app.route('/messages/health')
def health_check():
    return jsonify({'status': 'ok'})

if __name__ == '__main__':
    port = int(os.getenv('PORT', 3000))
    app.run(host='0.0.0.0', port=port) 