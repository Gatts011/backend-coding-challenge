import pytest
import sys
import os

# Add the project root to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utils.encryption import encrypt, decrypt, broken_decrypt

def test_encrypt_and_decrypt_should_work_correctly():
    test_message = 'Hello, World!'
    test_user_id = 'test-user-123'

    encrypted = encrypt(test_message, test_user_id)
    decrypted = decrypt(encrypted, test_user_id)

    assert decrypted == test_message
    assert encrypted != test_message
    assert all(c in 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=' for c in encrypted)

def test_broken_decrypt_should_fail_with_authentication_error():
    test_message = 'Hello, World!'
    test_user_id = 'test-user-123'

    encrypted = encrypt(test_message, test_user_id)
    
    with pytest.raises(Exception):
        broken_decrypt(encrypted, test_user_id)

def test_decrypt_should_fail_with_wrong_user_id():
    test_message = 'Hello, World!'
    test_user_id = 'test-user-123'

    encrypted = encrypt(test_message, test_user_id)
    
    with pytest.raises(ValueError, match='Decryption failed'):
        decrypt(encrypted, 'wrong-user')

def test_encryption_should_produce_different_results_for_same_message():
    test_message = 'Hello, World!'
    test_user_id = 'test-user-123'

    encrypted1 = encrypt(test_message, test_user_id)
    encrypted2 = encrypt(test_message, test_user_id)

    assert encrypted1 != encrypted2  # Different IVs
    assert decrypt(encrypted1, test_user_id) == test_message
    assert decrypt(encrypted2, test_user_id) == test_message 