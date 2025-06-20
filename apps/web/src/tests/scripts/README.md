# 🧪 Test Scripts Organization

This directory contains organized test scripts for backend testing and validation.

## 📁 Directory Structure

```
src/tests/scripts/
├── README.md                    # This file
├── auth/                        # Authentication testing scripts
├── database/                    # Database testing scripts
├── email/                       # Email service testing scripts
├── ai/                         # AI/Chatbot testing scripts
└── integrations/               # Third-party integration testing scripts
```

## 🔗 Script Mapping

### Original Scripts → New Organization

#### Database Tests
- `scripts/test-supabase-connection.js` → `src/tests/scripts/database/`
- `scripts/test-cms-operations.js` → `src/tests/scripts/database/`
- `scripts/test-post-creation.js` → `src/tests/scripts/database/`
- `scripts/test-media-sync.js` → `src/tests/scripts/database/`

#### Email Tests
- `scripts/test-email-development.js` → `src/tests/scripts/email/`
- `test-email-simple.js` → `src/tests/scripts/email/`

#### AI Tests
- `scripts/test-google-ai.js` → `src/tests/scripts/ai/`
- `scripts/test-chatbot.js` → `src/tests/scripts/ai/`

#### Integration Tests
- `scripts/test-production-posts-api.js` → `src/tests/scripts/integrations/`

## 🚀 Usage

### Run Database Tests
```bash
npm run test:db:connection
npm run test:db:cms
npm run test:db:posts
```

### Run Email Tests
```bash
npm run test:email:dev
npm run test:email:simple
```

### Run AI Tests
```bash
npm run test:ai:google
npm run test:ai:chatbot
```

### Run Integration Tests
```bash
npm run test:integration:api
```

## 📋 Test Categories

### 🗄️ Database Tests (HIGH Priority)
- **Connection Testing**: Verify Supabase/Firebase connectivity
- **CMS Operations**: Test content management functionality
- **Post Creation**: Validate blog post creation workflow
- **Media Sync**: Test media library synchronization

### 📧 Email Tests (MEDIUM Priority)
- **Development Testing**: Test email service without domain
- **Simple Email**: Basic email sending functionality
- **Template Testing**: Email template rendering

### 🤖 AI Tests (MEDIUM Priority)
- **Google AI**: Test Gemini model integration
- **Chatbot**: Test conversational AI functionality
- **Response Quality**: Validate AI response relevance

### 🔗 Integration Tests (MEDIUM Priority)
- **API Testing**: Test production API endpoints
- **Webhook Testing**: Validate webhook integrations
- **Third-party Services**: Test external service connections

## ⚠️ Important Notes

1. **Database tests are critical** - Never disable in production
2. **Email tests require API keys** - Set up Resend credentials
3. **AI tests require Google AI API key** - Configure in .env.local
4. **Integration tests may hit rate limits** - Use sparingly

## 🔧 Environment Variables

Required for testing:
```env
# Database
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key

# Email
RESEND_API_KEY=your_resend_key

# AI
GOOGLE_AI_API_KEY=your_google_ai_key

# Testing
ENABLE_TEST_ROUTES=true
NODE_ENV=development
```
