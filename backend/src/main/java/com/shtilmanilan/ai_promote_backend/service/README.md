# AI Services - Backend

## Overview
This backend provides endpoints for various AI services:
- **Text Generation:** OpenAI, Claude, Gemini, Groq for generating flier content
- **Image Analysis:** Azure Vision for color extraction and scene analysis

## Service Types

### 1. Text Generation Services
**Flow:** User → Frontend → Backend → AI Provider

1. **User** enters a prompt in the frontend UI.
2. **Frontend** sends a POST request to `/api/v1/{provider}/generate` with the prompt and temperature.
3. **Backend Controller** (e.g., `ClaudeController`) receives the request and creates a `TextGenerationRequest`.
4. **Service Implementation** (e.g., `ClaudeServiceImpl`) uses the API key to call the external AI provider.
5. **AI Provider** (e.g., Anthropic Claude) returns the generated text.
6. **Backend** wraps the result in a `TextGenerationResponse` and sends it back to the frontend.
7. **Frontend** displays the generated text to the user.

### 2. Azure Vision Service
**Flow:** Frontend → Backend → Azure Vision API

1. **User** uploads logo/photo in AI flier designer
2. **Frontend** converts images to base64 and sends to `/api/vision/analyze`
3. **AzureVisionController** receives base64 image data and applies rate limiting
4. **AzureVisionService** processes image and calls Azure Vision API
5. **Azure Vision API** analyzes image for colors, objects, scene type
6. **Backend** processes response and returns structured `AzureVisionResponse`
7. **Frontend** uses color analysis for flier generation

## Main Files

### Text Generation
- `ClaudeController.java`, `OpenAIController.java`, `GeminiController.java`, `GroqController.java`
- `ClaudeServiceImpl.java`, `OpenAIServiceImpl.java`, `GeminiServiceImpl.java`, `GroqServiceImpl.java`
- `TextGenerationRequest.java`, `TextGenerationResponse.java`
- `OpenAIApiKeyConfig.java`

### Azure Vision
- `controller/azure/AzureVisionController.java`
- `service/azure/AzureVisionService.java` 
- `model/azure/AzureVisionResponse.java`

### Rate Limiting
- `TokenBucketRateLimiter.java` - Token bucket implementation for rate limiting
- `RateLimiter.java` - Base rate limiter interface

## Adding a New Text Generation Provider
1. Create a new service interface and implementation in its own subfolder.
2. Add a new controller for the endpoint.
3. Update the frontend to call the new endpoint.

## Folder Structure
```
service/
  azure/
    AzureVisionService.java           # Image analysis & color extraction
  openai/
    OpenAIService.java
    OpenAIServiceImpl.java
  claude/
    ClaudeService.java
    ClaudeServiceImpl.java
  gemini/
    GeminiService.java
    GeminiServiceImpl.java
  groq/
    GroqService.java
    GroqServiceImpl.java
  TokenBucketRateLimiter.java         # Token bucket rate limiting implementation
  RateLimiter.java                    # Rate limiter interface

controller/
  azure/
    AzureVisionController.java        # /api/vision/analyze endpoint
    README.md                         # Detailed Azure Vision documentation
  ClaudeController.java               # /api/v1/claude/generate
  OpenAIController.java               # /api/v1/openai/generate
  GeminiController.java               # /api/v1/gemini/generate
  GroqController.java                 # /api/v1/groq/generate

model/
  azure/
    AzureVisionResponse.java          # Azure Vision response structure
  ai/
    TextGenerationRequest.java        # Text generation request structure
    TextGenerationResponse.java       # Text generation response structure
```

## Service Configurations

### Text Generation Services
- **API Keys:** Stored in `application.properties` or environment variables
- **Endpoints:** Each provider has unique base URLs and authentication
- **Rate Limiting:** Implemented per provider's limits

### Azure Vision Service  
- **Configuration:** `azure.vision.endpoint` and `azure.vision.key`
- **Features:** Color analysis, object detection, scene categorization
- **Processing:** Simplified photo-focused approach trusting Azure's analysis
- **Integration:** Used in AI flier designer for automatic color palette generation
- **Rate Limiting:** Token bucket implementation (5 initial requests, 1 request per 10 seconds)

## API Endpoints

### Text Generation
- `POST /api/v1/openai/generate`
- `POST /api/v1/claude/generate`
- `POST /api/v1/gemini/generate`
- `POST /api/v1/groq/generate`

### Image Analysis
- `POST /api/vision/analyze` - Analyze image for colors and scene
- `GET /api/vision/test` - Test Azure Vision API connection

## Rate Limiting
- **Token Bucket Algorithm:** Implements a token bucket for rate limiting
- **Azure Vision:** 5 initial requests, then 1 request per 10 seconds
- **IP Tracking:** Uses X-Forwarded-For and X-Real-IP headers for client identification
- **Response:** Returns 429 Too Many Requests when rate limit is exceeded

## Error Handling
- **Text Generation:** Fallback responses when AI providers fail
- **Azure Vision:** Default color palettes when image analysis fails
- **Rate Limiting:** Proper error responses with 429 status code
- **Logging:** Comprehensive error logging for debugging and monitoring 