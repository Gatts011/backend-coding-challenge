import os
import time
from typing import Dict, List
from dataclasses import dataclass
from datetime import datetime, timedelta

@dataclass
class Message:
    id: str
    message: str
    timestamp: str
    expires_at: datetime

class MessageService:
    def __init__(self):
        self.messages: Dict[str, List[Message]] = {}
        self._cleanup_expired_messages()

    def store_message(self, user_id: str, message: str, encrypted_message: str) -> Message:
        """Store a message for a user."""
        if user_id not in self.messages:
            self.messages[user_id] = []

        message_data = Message(
            id=os.urandom(16).hex(),
            message=encrypted_message,
            timestamp=datetime.utcnow().isoformat(),
            expires_at=datetime.utcnow() + timedelta(minutes=10)
        )

        self.messages[user_id].append(message_data)
        return message_data

    def get_messages(self, user_id: str) -> List[Message]:
        """Get all non-expired messages for a user."""
        self._cleanup_expired_messages()
        return self.messages.get(user_id, [])

    def _is_expired(self, message: Message) -> bool:
        """Check if a message is expired."""
        return datetime.utcnow() > message.expires_at

    def _cleanup_expired_messages(self) -> None:
        """Clean up expired messages."""
        for user_id in list(self.messages.keys()):
            self.messages[user_id] = [
                msg for msg in self.messages[user_id]
                if not self._is_expired(msg)
            ]
            if not self.messages[user_id]:
                del self.messages[user_id]

message_service = MessageService() 