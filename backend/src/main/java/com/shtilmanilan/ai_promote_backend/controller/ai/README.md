# AI Controllers - Backend

## Overview
This subfolder contains all REST controllers responsible for handling AI text generation requests from the frontend. Each controller manages HTTP endpoints for a specific AI provider and delegates the actual text generation to the corresponding service implementation.

## Controller Architecture

### Flow: Frontend → Controller → Service → AI Provider
1. **Frontend** sends HTTP POST request to `/api/v1/{provider}/generate`
2. **Controller** receives the request and validates the `TextGenerationRequest`
3. **Controller** delegates to the appropriate **Service** (e.g., `ClaudeService`)
4. **Service** handles API communication with external AI provider
5. **Controller** returns `TextGenerationResponse` to frontend

## Available Controllers

### 🤖 ClaudeController.java
- **Endpoint**: `/api/v1/claude/*`
- **Service**: `ClaudeService` (Anthropic Claude API)
- **Features**: Fallback to Groq on rate limit (429 errors)
- **Test Endpoint**: `GET /api/v1/claude/test`

### 🧠 OpenAIController.java  
- **Endpoint**: `/api/v1/openai/*`
- **Service**: `OpenAIService` (OpenAI GPT API)
- **Test Endpoint**: `GET /api/v1/openai/test`

### ⚡ GroqController.java
- **Endpoint**: `/api/v1/groq/*` 
- **Service**: `GroqService` (Groq API)
- **Features**: Fallback to Gemini on rate limit (429 errors)
- **Test Endpoint**: `GET /api/v1/groq/test`

### 💎 GeminiController.java
- **Endpoint**: `/api/v1/gemini/*`
- **Service**: `GeminiService` (Google Gemini API)
- **Features**: Final fallback in the chain
- **Test Endpoint**: `GET /api/v1/gemini/test`

## Common Endpoints

All controllers implement the same endpoint pattern:

### POST `/api/v1/{provider}/generate`
- **Request Body**: `TextGenerationRequest`
  ```json
  {
    "prompt": "Your text prompt here",
    "temperature": 0.7
  }
  ```
- **Response**: `TextGenerationResponse`
  ```json
  {
    "generatedText": "AI generated response",
    "provider": "claude|openai|groq|gemini"
  }
  ```

### GET `/api/v1/{provider}/test`
- **Response**: Simple status message confirming API is working

## Error Handling & Fallbacks

### Rate Limiting Strategy
- **Claude** → Falls back to **Groq** on 429 errors
- **Groq** → Falls back to **Gemini** on 429 errors  
- **Gemini** → Final fallback (no further fallback)
- **OpenAI** → Standalone (no automatic fallback)

### CORS Configuration
All controllers are configured with:
```java
@CrossOrigin(origins = "http://localhost:3000")
```

## Controller Responsibilities

### ✅ What Controllers Handle:
- HTTP request/response mapping
- Request validation and logging
- Service delegation
- Error handling and logging
- CORS configuration

### ❌ What Controllers DON'T Handle:
- Direct AI API communication (handled by Services)
- API key management (handled by Config classes)
- Business logic (handled by Services)
- Fallback logic (handled by Service implementations)

## Related Components

### Services
- Located in: `../service/{provider}/`
- Handle actual AI API communication
- Implement fallback mechanisms

### Models
- `TextGenerationRequest.java` - Input model
- `TextGenerationResponse.java` - Output model

### Configuration
- `ClaudeApiKeyConfig.java` - Claude API key
- `ApiKeyConfig.java` - OpenAI API key
- `WebConfig.java` - CORS configuration
- `AppConfig.java` - RestTemplate bean

## Adding a New AI Provider Controller

1. **Create Controller**: `NewProviderController.java`
   ```java
   @RestController
   @RequestMapping("/api/v1/newprovider")
   @CrossOrigin(origins = "http://localhost:3000")
   public class NewProviderController {
       // Implementation
   }
   ```

2. **Create Service Interface & Implementation** in `../service/newprovider/`

3. **Update Frontend** to call new endpoint

4. **Add API Key Configuration** if needed

## Package Structure
```
controller/ai/
├── README.md (this file)
├── ClaudeController.java
├── OpenAIController.java  
├── GroqController.java
└── GeminiController.java
```

## Testing
Each controller provides a test endpoint to verify connectivity:
- `curl http://localhost:8080/api/v1/claude/test`
- `curl http://localhost:8080/api/v1/openai/test`
- `curl http://localhost:8080/api/v1/groq/test`
- `curl http://localhost:8080/api/v1/gemini/test` 