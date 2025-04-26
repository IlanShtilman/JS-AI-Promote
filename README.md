# AI-Promote

A full-stack application for generating promotional content using various AI models (OpenAI, Claude, Groq, and Gemini).

## Features

- Generate promotional content using multiple AI models
- Support for both English and Hebrew languages
- Modern React frontend with Material-UI
- Spring Boot backend with AI integration
- Responsive design for all devices

## Tech Stack

### Frontend
- React
- Material-UI
- Axios for API calls
- Environment variables for configuration

### Backend
- Spring Boot
- Java
- Maven
- OpenAI API
- Gemini API

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- Java JDK 17
- Maven
- API keys for:
  - OpenAI
  - Gemini

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
│   │   │   ├── java/       # Java source files
│   │   │   └── resources/  # Configuration files
│   │   └── test/           # Test files
│   └── pom.xml             # Maven configuration
├── public/                  # Static files
├── src/                     # React frontend source
│   ├── components/         # React components
│   ├── services/           # API services
│   └── App.js              # Main application file
├── .env                    # Environment variables
├── package.json            # Node.js dependencies
└── README.md               # This file
```

## API Endpoints

### Backend
- `POST /api/v1/openai/generate` - Generate content using OpenAI
- `POST /api/v1/gemini/generate` - Generate content using Gemini

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 