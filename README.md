# 🔐 Secure Messaging API

> A modern, secure messaging API implemented in both TypeScript and Python, featuring end-to-end encryption, Docker support, and comprehensive testing.

## 🌟 Features

- ✨ End-to-end encryption with AES-256-GCM
- 🔒 User-specific message encryption
- ⚡ Rate limiting and input validation
- 🕒 Message auto-expiry
- 🎯 Health monitoring
- 🐳 Docker support

## 🏗️ Architecture

```
typescript_version/  # Express.js + TypeScript
python_version/     # Flask + Python
```

*Detailed documentation available in each version's directory.*

## 🚀 Quick Start

### Using Docker (Recommended)
```bash
docker-compose up --build
```
- TypeScript API → http://localhost:3000
- Python API → http://localhost:3001

### Manual Setup

TypeScript:
```bash
cd typescript_version
npm install && npm start
```

Python:
```bash
cd python_version
pip install -r requirements.txt
python app.py
```

## 🔌 API Endpoints

```http
POST /messages
GET  /messages/:userId
GET  /messages/health
```

## 🧪 Testing

```bash
# TypeScript
cd typescript_version && npm test

# Python
cd python_version && pytest
```

## 🔐 Security Features

- AES-256-GCM encryption
- Per-message IV generation
- Message authentication
- Rate limiting
- Input validation
- Token-based auth

## 📚 Documentation
See individual READMEs in each version's directory for:
- Detailed API documentation
- Security implementation details
- Development guidelines
- Testing instructions
