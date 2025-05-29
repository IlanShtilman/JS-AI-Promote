# Azure Vision Integration

This folder contains the Azure Vision integration components for the AI Flier Creator application. This README explains the complete process from frontend image upload to Azure AI analysis and color extraction.

## 🏗️ Architecture Overview

```
Frontend (React)                    Backend (Spring Boot)               Microsoft Azure
┌─────────────────────┐            ┌────────────────────────┐          ┌──────────────────┐
│                     │            │                        │          │                  │
│  Image Upload       │   Base64   │  AzureVisionController │   HTTP   │  Azure Vision    │
│  (Logo/Photo)       │────────────│  /api/vision/analyze   │──────────│  API v3.1       │
│                     │            │                        │          │                  │
│  azureVisionService │◄───────────│  AzureVisionService    │◄─────────│  Color Analysis  │
│  (Frontend)         │   JSON     │  (Backend)             │   JSON   │  Scene Detection │
│                     │            │                        │          │  Object Detection│
└─────────────────────┘            └────────────────────────┘          └──────────────────┘
```

## 📋 Complete Data Flow

### 1. Frontend Image Processing
**Location:** `src/services/AzureVision/azureVisionService.js`

```javascript
// User uploads image(s) → Convert to base64 → Send to backend
analyzeMultipleImagesWithAzure({
  logo: 'data:image/jpeg;base64,/9j/4AAQ...',
  photo: 'data:image/png;base64,iVBORw0KGg...'
});
```

**Process:**
1. **Image Input Handling:** Accepts URLs or base64 data
2. **Base64 Conversion:** Converts image URLs to base64 if needed
3. **Multi-Image Analysis:** Processes logo and photo separately
4. **Parallel Processing:** Analyzes multiple images simultaneously
5. **Color Unification:** Combines colors from both sources intelligently

### 2. Backend API Endpoint
**Location:** `AzureVisionController.java`

```java
@PostMapping(value = "/analyze")
public AzureVisionResponse analyzeImage(@RequestBody String base64Image)
```

**Process:**
1. **Receives:** Raw base64 image data
2. **Validates:** Image format and size
3. **Delegates:** Processing to `AzureVisionService`
4. **Returns:** Structured `AzureVisionResponse` JSON

### 3. Azure Vision Service (Backend)
**Location:** `AzureVisionService.java`

```java
public AzureVisionResponse analyzeImage(String base64Image)
```

**Process:**
1. **Image Preparation:**
   - Removes data URL prefix (`data:image/jpeg;base64,`)
   - Decodes base64 to byte array
   - Validates image data

2. **Azure API Call:**
   ```java
   POST https://[endpoint]/vision/v3.1/analyze
   Parameters: visualFeatures=Categories,Description,Color,Objects
   Headers: Ocp-Apim-Subscription-Key
   Body: Binary image data
   ```

3. **Response Processing:**
   - **Scene Analysis:** Categories → `sceneType`
   - **Object Detection:** Objects array → `objects[]`
   - **Color Extraction:** Color data → `colors` object
   - **Description:** Captions → `description`
   - **Business Type:** Simple logic based on scene/objects

## 🎨 Color Analysis Process

### Azure Color Detection
Azure Vision API provides:
```json
{
  "color": {
    "dominantColorForeground": "Brown",
    "dominantColorBackground": "Brown", 
    "dominantColors": ["Brown", "Black"],
    "accentColor": "B0651A",
    "isBWImg": false
  }
}
```

### Backend Color Processing
**Simplified Logic (Post-Refactor):**
```java
// TRUST Azure Vision analysis with simple fallbacks only
colors.setPrimary(dominantColorsHex.get(0));
colors.setSecondary(dominantColorsHex.get(1)); 
colors.setAccent(accentColor);
colors.setBackground(backgroundColor);
colors.setDominantColors(dominantColorsHex);
```

**Color Name to Hex Mapping:**
```java
// Clean mapping without business assumptions
"brown" → "#8B4513"
"blue" → "#4169E1"
"red" → "#DC143C"
// + 20 more standard colors
```

### Frontend Color Unification
**Intelligent Distribution Strategy:**
```javascript
if (logoColors && photoColors) {
  // Strategic distribution for brand consistency
  unified.primary = logoColors.dominantColors[0];    // Brand identity
  unified.accent = logoColors.dominantColors[1];     // Brand accent
  unified.secondary = photoColors.dominantColors[0]; // Environmental context
  unified.background = photoColors.background;       // Environmental background
}
```

## 📊 Response Structure

### AzureVisionResponse (Backend)
```java
public class AzureVisionResponse {
    private String sceneType;        // "indoor", "food", "building"
    private String[] objects;        // ["food", "table", "person"]
    private Colors colors;           // Color analysis object
    private String atmosphere;       // "neutral" (default)
    private String lighting;         // "natural" (default)
    private String description;      // "A plate of food on a table"
    private String businessType;     // "restaurant", "cafe", "retail"
    
    public static class Colors {
        private String primary;      // "#8B4513"
        private String secondary;    // "#4169E1"
        private String accent;       // "#FFD700"
        private String background;   // "#FFFFFF"
        private List<String> dominantColors; // ["#8B4513", "#4169E1", "#FFD700"]
    }
}
```

### Frontend Combined Analysis
```javascript
{
  hasLogo: true,
  hasPhoto: true,
  logoAnalysis: { /* Single logo analysis */ },
  photoAnalysis: { /* Single photo analysis */ },
  colors: { /* Unified color palette */ },
  businessType: "restaurant",
  sceneType: "food",
  combinedObjects: ["food", "logo", "text"],
  combinedDescription: "Logo: Company branding. Scene: A plate of food"
}
```

## ⚙️ Configuration & Setup

### Backend Configuration
**Required Environment Variables:**
```properties
# application.properties
azure.vision.endpoint="https://your-region.api.cognitive.microsoft.com"
azure.vision.key=your-azure-vision-api-key
```

**Dependencies (pom.xml):**
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
<dependency>
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId>
</dependency>
```

### Frontend Configuration
**API Endpoint:**
```javascript
// Fixed endpoint in azureVisionService.js
const API_ENDPOINT = 'http://localhost:8081/api/vision/analyze';
```

**File Upload Limits:**
```javascript
// In AIInfoCollectionConfig.js
upload: {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  acceptedFormats: "image/*"
}
```

## 🔄 Integration Points

### 1. Component Usage
```javascript
// In AIInfoCollection.js
import { analyzeMultipleImagesWithAzure } from '../../../services/AzureVision/azureVisionService';

const analysisResult = await analyzeMultipleImagesWithAzure({
  logo: initialData.logo,           // From previous step
  photo: formData.uploadedImage     // User uploaded
});
```

### 2. Rules Engine Integration
```javascript
// In simpleRulesEngine.js
const params = {
  azureColors: {
    logo: flierData.logoAnalysis?.colors,
    photo: flierData.photoAnalysis?.colors, 
    unified: flierData.colors
  }
};
```

### 3. UI Display Integration
```javascript
// In AIFlierSummary.js
<ColorAnalysisSection
  title="Logo Colors"
  colors={info.logoAnalysis?.colors}
  source="AI Analysis"
/>
```

## 🚀 Simplified Architecture Benefits

### Before Refactor (Complex)
- ❌ Business-specific color overrides (Domino's red→blue)
- ❌ Context-based color forcing (restaurants→brown)
- ❌ Complex brand-specific logic
- ❌ 500+ lines of color enhancement algorithms

### After Refactor (Simplified)
- ✅ **Photo-focused:** Trust Azure's actual image analysis
- ✅ **Simple fallbacks:** Default colors only when Azure fails
- ✅ **Maintainable:** ~200 lines shorter, clear logic
- ✅ **Scalable:** No hardcoded business assumptions
- ✅ **Reliable:** Based on real image content, not guesses

## 🛠️ Development & Testing

### Backend Testing
```bash
# Test the endpoint directly
curl -X POST http://localhost:8081/api/vision/analyze \
  -H "Content-Type: text/plain" \
  -d "data:image/jpeg;base64,/9j/4AAQ..."

# Test color mappings
GET http://localhost:8081/api/vision/test-colors
```

### Frontend Testing
```javascript
// Test backend connection
import { testBackendConnection } from './services/AzureVision/azureVisionService';

const result = await testBackendConnection();
console.log(result); // { success: true, message: "Azure Vision API is working!" }
```

### Error Handling
```javascript
// Frontend graceful fallback
catch (error) {
  console.error('Azure Vision failed:', error);
  return {
    colors: { primary: '#666666', secondary: '#999999', accent: '#CCCCCC' },
    businessType: 'general business',
    sceneType: 'general'
  };
}
```

## 📈 Usage Analytics & Monitoring

### Logging Points
1. **Frontend:** Image upload size and format
2. **Backend:** Azure API response time and success rate  
3. **Azure:** API quota usage and error rates

### Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| `Empty response` | Invalid image format | Validate base64 format |
| `Quota exceeded` | Azure API limits | Implement rate limiting |
| `CORS errors` | Frontend/backend mismatch | Check WebConfig CORS settings |
| `Color not found` | Unknown color name | Add to `getHexForColorName()` mapping |

## 🔮 Future Enhancements

1. **Database Caching:** Store analysis results to reduce API calls
2. **Batch Processing:** Analyze multiple images in single request
3. **Custom Training:** Train Azure Custom Vision for business-specific detection
4. **Real-time Preview:** Live color preview as user uploads images
5. **A/B Testing:** Compare Azure vs other vision APIs

---

## 📁 File Structure

```
backend/
└── src/main/java/com/shtilmanilan/ai_promote_backend/
    ├── controller/azure/
    │   ├── AzureVisionController.java  # REST endpoint
    │   └── README.md                   # This file
    ├── model/azure/
    │   └── AzureVisionResponse.java    # Response structure
    └── service/
        └── AzureVisionService.java     # Core logic

frontend/
└── src/services/AzureVision/
    └── azureVisionService.js           # Frontend service
```

## 🤝 Contributing

When modifying Azure Vision integration:

1. **Test with real images** - Use actual logo/photo combinations
2. **Verify color accuracy** - Check if generated colors match image content
3. **Monitor API usage** - Azure Vision has quota limits
4. **Update both frontend/backend** - Maintain API contract
5. **Document changes** - Update this README for new features

---

*Last updated: November 2024*  
*Azure Vision API Version: v3.1*  
*Backend Framework: Spring Boot 3.x*  
*Frontend Framework: React 18.x* 