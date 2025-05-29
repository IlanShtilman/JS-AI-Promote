# AI Text Generation Service - Backend

## Overview
This backend provides endpoints for generating text using various AI providers (OpenAI, Claude, Gemini, Groq).

## Flow: User → Frontend → Backend → AI Provider

1. **User** enters a prompt in the frontend UI.
2. **Frontend** sends a POST request to `/api/v1/{provider}/generate` with the prompt and temperature.
3. **Backend Controller** (e.g., `ClaudeController`) receives the request and creates a `TextGenerationRequest`.
4. **Service Implementation** (e.g., `ClaudeServiceImpl`) uses the API key to call the external AI provider.
5. **AI Provider** (e.g., Anthropic Claude) returns the generated text.
6. **Backend** wraps the result in a `TextGenerationResponse` and sends it back to the frontend.
7. **Frontend** displays the generated text to the user.

## Main Files
- `ClaudeController.java`, `OpenAIController.java`, etc.
- `ClaudeServiceImpl.java`, `OpenAIServiceImpl.java`, etc.
- `TextGenerationRequest.java`, `TextGenerationResponse.java`
- `ClaudeApiKeyConfig.java`, etc.

## Adding a New Provider
1. Create a new service interface and implementation in its own subfolder.
2. Add a new controller for the endpoint.
3. Update the frontend to call the new endpoint.

## Folder Structure Example
```
service/
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
  ...
``` 