# AI-Promote

A full-stack application for generating promotional content and flyer designs using multiple AI models (OpenAI, Claude, Groq, Gemini) and a modern, interactive React frontend.

## Features

- Generate promotional content and flyer layouts using multiple AI models
- AI Assist panel for reviewing and previewing AI-generated flyer suggestions
- Manual flyer designer for full user control
- Support for both English and Hebrew languages
- Modern React frontend with Material-UI
- Spring Boot backend with AI integration
- Responsive design for all devices

## Tech Stack

### Frontend
- React
- Material-UI
- Axios for API calls
- html2canvas, qrcode.react, react-color, etc.
- Environment variables for configuration

### Backend
- Spring Boot
- Java
- Maven
- OpenAI, Gemini, Claude, Groq APIs

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- Java JDK 17
- Maven
- API keys for:
  - OpenAI
  - Gemini
  - Claude
  - Groq

### Frontend Setup
1. Navigate to the project root directory
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory with your API keys:
   ```
   REACT_APP_OPENAI_API_KEY=your_openai_key
   REACT_APP_GEMINI_API_KEY=your_gemini_key
   REACT_APP_CLAUDE_API_KEY=your_claude_key
   REACT_APP_GROQ_API_KEY=your_groq_key
   ```
4. Start the development server:
   ```bash
   npm start
   ```

### Backend Setup
1. Navigate to the `backend` directory
2. Build the project:
   ```bash
   mvn clean install
   ```
3. Run the application:
   ```bash
   mvn spring-boot:run
   ```

## Project Structure

```
AI-Promote/
├── backend/                 # Spring Boot backend
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   ├── controller/   # API controllers
│   │   │   │   ├── service/      # AI and utility services
│   │   │   │   ├── model/        # Data models
│   │   │   │   └── config/       # API key and web config
│   │   │   └── resources/        # Configuration files
│   │   └── test/                 # Test files
│   ├── pom.xml                   # Maven configuration
│   ├── mvnw, mvnw.cmd            # Maven wrapper
│   └── .gitignore, .gitattributes
├── public/                  # Static files and assets
│   ├── assets/              # App images (e.g., Phone-APP.png)
│   └── images/              # User-uploaded or sample images
├── src/                     # React frontend source
│   ├── services/            # API and utility services
│   │   ├── aiService.js
│   │   ├── azureVisionService.js
│   │   ├── speechService.js
│   │   ├── elevenLabsService.js
│   │   └── imagenService.js
│   ├── App.js               # Main application file
│   ├── components/          # React components
│   │   ├── FlyerRenderer.js
│   │   ├── ManualFlierDesigner.js
│   │   ├── AIFlierSummary.js
│   │   ├── AIInfoCollection.js
│   │   ├── DesignModeSelection.js
│   │   ├── DesignSuggestions.js
│   │   └── ...
│   ├── index.js
│   └── index.css
├── .env                     # Environment variables
├── package.json, package-lock.json
├── README.md                # This file
└── .vscode/                 # VSCode settings
```

## Backend Services & Controllers

- **Controllers:**
  - `FlierController.java` (flyer generation endpoints)
  - `OpenAIController.java`, `GeminiController.java`, `ClaudeController.java`, `GroqController.java` (AI endpoints)
  - `AzureVisionController.java` (image analysis)
  - `ErrorHandlerController.java` (error handling)
- **Services:**
  - `BackgroundGenerationService.java`, `OpenAIServiceImpl.java`, `GeminiServiceImpl.java`, `ClaudeServiceImpl.java`, `GroqServiceImpl.java`, `AzureVisionService.java`
- **Models:**
  - `FlierInfo.java`, `FlierConfig.java`, `AzureVisionResponse.java`, `BackgroundGenerationRequest.java`, `BackgroundOption.java`, `TextGenerationRequest.java`, `TextGenerationResponse.java`
- **Config:**
  - `ApiKeyConfig.java`, `GeminiApiKeyConfig.java`, `ClaudeApiKeyConfig.java`, `GroqApiKeyConfig.java`, `WebConfig.java`

## Frontend Components & Services

- **Main Components:**
  - `FlyerRenderer.js` (AI flyer preview)
  - `ManualFlierDesigner.js` (manual flyer editor)
  - `AIFlierSummary.js`, `AIInfoCollection.js`, `DesignModeSelection.js`, `DesignSuggestions.js`
- **Services:**
  - `aiService.js`, `azureVisionService.js`, `simpleRulesEngine.js`, `backgroundGeneratorService.js`, `speechService.js`, `elevenLabsService.js`, `imagenService.js`

## AI Assist / Approval Workflow

- After generating a flyer with AI, users can view the AI's suggested layout, colors, fonts, and rationale in a dedicated "AI Assist" panel or window.
- The `FlyerRenderer` component previews the AI-generated flyer config.
- Users can review the AI's suggestions and rationale before proceeding.
- The manual designer remains the main tool for flyer creation and editing; AI suggestions are provided as inspiration.

## API Endpoints

### Backend
- `POST /api/flier/generate` - Generate flyer using simplified pipeline
- `POST /api/backgrounds/generate` - Generate AI background options
- `GET /api/backgrounds/cost` - Get background generation cost estimation
- `POST /api/openai/generate` - Generate content using OpenAI
- `POST /api/gemini/generate` - Generate content using Gemini
- `POST /api/claude/generate` - Generate content using Claude
- `POST /api/groq/generate` - Generate content using Groq
- `POST /api/azure-vision/analyze` - Analyze image with Azure Vision

## Assets
- App images and assets are in `public/assets/` (e.g., `Phone-APP.png`)
- User-uploaded images are stored in `public/images/` (if applicable)

## Usage

1. Fill out flyer details and generate with AI.
2. Review the AI's suggestions in the AI Assist panel.
3. Use the manual designer to create and edit your flyer, optionally using AI suggestions as inspiration.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 