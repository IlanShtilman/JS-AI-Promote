# AIFlier Component

A sophisticated, AI-powered flier builder with multi-language support and intelligent styling.

## 🌟 Features

### 🤖 AI-Powered Styling
- **Intelligent Background Processing**: Converts raw AI recommendations into complete style configurations
- **Smart Typography**: Automatically derives font weights, spacing, and alignment from AI font choices
- **Color Harmony**: AI analyzes uploaded images to extract harmonious color palettes
- **Fallback System**: Language-aware default styles when AI recommendations aren't available

### 🌍 Multi-Language Support
- **Automatic Language Detection**: Detects Hebrew, English, Russian, and Chinese from content
- **RTL/LTR Layout Adaptation**: Automatically switches layouts based on text direction
- **Language-Specific Typography**: Optimized font choices and spacing for each language
- **Cultural Layout Preferences**: Different positioning for different writing systems

### 🎨 Configuration-Driven Architecture
- **Modular Config System**: Separate files for patterns, languages, styles, and layouts
- **Language-Aware Positioning**: Phone assets, QR codes, and content adapt to language
- **Pattern Templates**: Reusable background patterns (dots, grids, diagonals, etc.)
- **Default Style Mappings**: Business-type specific fallback styles

### 📱 Responsive Design
- **Mobile-First**: Optimized for all screen sizes
- **Touch-Friendly**: Large touch targets and intuitive interactions
- **Export Ready**: High-quality PNG export with html2canvas

## 🏗️ Architecture

### Component Structure
```
src/components/AIFlier/
├── AIFlier.js                 # Main component with state management
├── AIFlier.css               # Component styles
├── tabs/                     # Tab components
│   ├── TabNavigation.js      # Tab switching interface
│   ├── BackgroundTab.js      # AI background selection
│   ├── ContentTab.js         # Content editing with language detection
│   └── StyleTab.js           # Style customization controls
├── preview/                  # Preview components
│   └── FlierPreview.js       # Live flier preview with language layouts
└── config/                   # Configuration files
    ├── patternTemplates.js   # Background pattern definitions
    ├── languageConfig.js     # Multi-language configuration
    └── defaultStyles.js      # Fallback style system
```

### State Management
The component uses React hooks for state management with clear separation:

- **UI State**: Active tabs, font sizes, border radius, photo settings
- **Content State**: Title, promotional text, QR codes, images
- **Style State**: Processed AI recommendations, color overrides, typography

## 🔧 Configuration System

### Language Configuration (`languageConfig.js`)
```javascript
// Supported languages with metadata
SUPPORTED_LANGUAGES = {
  hebrew: { flag: '🇮🇱', direction: 'rtl', name: 'עברית' },
  english: { flag: '🇺🇸', direction: 'ltr', name: 'English' },
  russian: { flag: '🇷🇺', direction: 'ltr', name: 'Русский' },
  chinese: { flag: '🇨🇳', direction: 'ltr', name: '中文' }
}

// Language-specific content templates
LANGUAGE_CONTENT = {
  hebrew: {
    qrInstructions: "סרקו את הקוד ותיהנו מהטבות בלעדיות"
  }
  // ... other languages
}

// Layout configurations for each language
FLIER_LAYOUT_CONFIG = {
  hebrew: {
    grid: { gridTemplateColumns: '1fr 1.5fr' },
    phone: { 
      gridColumn: 1,
      transform: 'translateX(40px) translateY(-35px) rotate(-12deg) scale(1.8)'
    },
    qrCode: { gridColumn: 1, justifySelf: 'start' },
    content: { gridColumn: 2, textAlign: 'right' }
  },
  english: {
    grid: { gridTemplateColumns: '1.5fr 1fr' },
    phone: { 
      gridColumn: 2,
      transform: 'translateX(-25px) translateY(-20px) rotate(12deg) scale(1.7)'
    },
    qrCode: { gridColumn: 2, justifySelf: 'end' },
    content: { gridColumn: 1, textAlign: 'left' }
  }
  // ... other languages
}
```

### Pattern Templates (`patternTemplates.js`)
Reusable SVG patterns for backgrounds:
```javascript
export const patternTemplates = {
  dots: {
    pattern: 'radial-gradient(circle, #ddd 1px, transparent 1px)',
    size: '20px 20px',
    description: 'Subtle dotted pattern'
  },
  // ... more patterns
}
```

### Default Styles (`defaultStyles.js`)
Fallback styles when AI recommendations aren't available:
```javascript
export const DEFAULT_STYLE_OPTIONS = [
  {
    styleName: 'Professional Blue',
    backgroundColor: '#f8f9fa',
    textColor: '#2c3e50',
    primaryColor: '#3498db',
    // ... complete style definition
  }
  // ... more default styles
]
```

## 🤖 AI Integration

### Background Options Processing
The component receives raw AI recommendations and processes them into complete style configurations:

```javascript
const processBackgroundOptions = (rawOptions) => {
  return rawOptions.map((option, index) => {
    // Derive complete typography from AI decisions
    const fontFamily = option.fontFamily || 'Roboto, sans-serif';
    
    // Apply font-specific typography rules
    let letterSpacing, lineHeight, titleWeight;
    if (fontFamily.includes('Georgia')) {
      letterSpacing = '0.01em';
      lineHeight = 1.2;
      titleWeight = 700;
    }
    // ... more typography logic
    
    return {
      // AI-decided properties
      backgroundImage: option.backgroundImage,
      textColor: option.textColor,
      fontFamily: fontFamily,
      
      // Derived properties
      letterSpacing: letterSpacing,
      lineHeight: lineHeight,
      titleWeight: titleWeight,
      
      // Metadata
      styleName: option.styleName || `Style ${index + 1}`,
      source: 'ai'
    };
  });
};
```

### Smart Typography Derivation
The system automatically derives complete typography configurations from AI font choices:

- **Serif Fonts** (Georgia, Playfair): Elegant spacing, center alignment, moderate weights
- **Modern Fonts** (Montserrat): Tight spacing, bold weights, language-aware alignment  
- **Professional Fonts** (Roboto, Arial): Clean spacing, strong weights, optimized readability

## 🌍 Language Support

### Automatic Language Detection
```javascript
const detectLanguageFromText = (text) => {
  if (!text) return 'english';
  
  // Hebrew detection
  if (/[\u0590-\u05FF]/.test(text)) return 'hebrew';
  // Cyrillic detection  
  if (/[\u0400-\u04FF]/.test(text)) return 'russian';
  // Chinese detection
  if (/[\u4e00-\u9fff]/.test(text)) return 'chinese';
  
  return 'english';
};
```

### Layout Adaptation
Each language has specific layout configurations:

- **Hebrew (RTL)**: Content on right, phone on left, QR code on left
- **English (LTR)**: Content on left, phone on right, QR code on right  
- **Russian/Chinese (LTR)**: Similar to English with cultural adaptations

### Photo Positioning
The "Use previously uploaded photo" feature adapts to language:

```javascript
// In ContentTab.js
const photoPosition = language === 'hebrew' 
  ? 'bottom left corner' 
  : 'bottom left corner (aligned with QR Code height)';
```

## 📋 Usage

### Basic Implementation
```jsx
import AIFlier from './components/AIFlier/AIFlier';

const App = () => {
  const backgroundOptions = [
    {
      backgroundImage: 'https://example.com/ai-generated-bg.jpg',
      textColor: '#ffffff',
      fontFamily: 'Montserrat',
      styleName: 'Modern Bold'
    }
    // ... more AI recommendations
  ];

  const flyerContent = {
    title: "Your Amazing Title",
    promotionalText: "Compelling promotional content...",
    qrUrl: "https://your-website.com",
    logo: logoImageData,
    image: productImageData
  };

  return (
    <AIFlier 
      backgroundOptions={backgroundOptions}
      flyerContent={flyerContent}
    />
  );
};
```

### Props Interface
```typescript
interface AIFlierProps {
  backgroundOptions?: Array<{
    backgroundImage?: string;
    backgroundColor?: string;
    textColor?: string;
    fontFamily?: string;
    fontSize?: number;
    styleName?: string;
    // ... other AI-provided properties
  }>;
  
  flyerContent?: {
    title?: string;
    promotionalText?: string;
    callToAction?: string;
    qrUrl?: string;
    logo?: string | null;
    image?: string | null;
  };
}
```

## 🎯 Key Features Explained

### 1. Smart Font Size Management
- AI provides initial font sizes
- User adjustments take priority over AI recommendations
- `hasUserAdjustedFonts` flag prevents AI overrides after manual changes

### 2. Background Intelligence
- Detects image vs. color backgrounds
- Hides irrelevant controls (e.g., background color for image backgrounds)
- Provides contextual help and guidance

### 3. Export Optimization
- High-quality PNG export with 2x scaling
- Temporary style adjustments for optimal export quality
- CORS-enabled for external image handling

### 4. Performance Optimization
- Lazy style processing with useEffect
- Efficient re-renders with proper dependency arrays
- Minimal re-computation of derived values

## 🚀 Future Enhancements

- **Additional Languages**: Arabic, Spanish, French support
- **Advanced Patterns**: More sophisticated background patterns
- **Animation Support**: Subtle animations and transitions
- **Template System**: Pre-built flier templates
- **Collaboration**: Multi-user editing capabilities
- **Analytics**: Usage tracking and optimization insights

## 🔧 Development Notes

### Code Organization
- **Separation of Concerns**: Clear separation between UI, logic, and configuration
- **Reusable Components**: Modular tab components for easy maintenance
- **Configuration-Driven**: Easy to extend with new languages, patterns, and styles
- **Type Safety Ready**: Structured for easy TypeScript migration

### Performance Considerations
- **Efficient Re-renders**: Careful use of useEffect dependencies
- **Lazy Loading**: Configuration files loaded only when needed
- **Memory Management**: Proper cleanup of event listeners and file readers

### Accessibility
- **Keyboard Navigation**: Full keyboard support for all controls
- **Screen Reader Support**: Proper ARIA labels and semantic HTML
- **Color Contrast**: Ensures adequate contrast ratios
- **Touch Targets**: Minimum 44px touch targets for mobile

---

*Built with React, Material-UI, and lots of attention to detail for creating beautiful, accessible, multi-language fliers.* 