# Manual Flier Designer Configuration

This component uses a centralized configuration system that makes it easy to customize and extend the flier designer without diving into the main component code.

## Configuration Files

All settings are located in these files:
- `ManualFlierDesignerConfig.js` - Main configuration
- `ManualFlierDesignerIcons.js` - Icon definitions and components

### 🎨 Font Options
```js
FONT_OPTIONS: [
  { value: 'Heebo', label: 'Heebo' },
  { value: 'Assistant', label: 'Assistant' },
  { value: 'Rubik', label: 'Rubik' },
  // Add more fonts here
]
```

### 🔧 Default Values
All initial state values for the component:
- `backgroundColor`, `titleColor`, `textColor`
- `titleFont`, `textFont`, `titleSize`, `textSize`
- `borderRadius`, `imagePosition`, etc.

### 📏 Limits and Ranges
Size constraints and validation rules:
- Title size: 20-80px
- Text size: 12-40px  
- Border radius: 0-50px
- Image position: 0-100%

### 🖼️ Visual Settings
- Canvas dimensions and padding
- Image upload settings and drag behavior
- Logo and phone preview positioning
- QR code size and placement
- Footer styling and brand settings

### 🌐 Text Content
Bilingual text support with placeholder system:
```js
TEXT_CONTENT: {
  Hebrew: { /* Hebrew translations */ },
  English: { /* English translations */ }
}
```

### 🎯 Icon System
Clean, centralized icon management:
```js
ICONS: {
  defaultSize: 24,
  buttonIconSize: 20,
  sizes: { small: 16, medium: 24, large: 32 },
  style: 'default', // 'default', 'rounded', 'outline'
  color: 'currentColor',
}
```

### 📁 File Settings
- Download filename and format
- Supported image types
- Export quality settings

## How to Customize

### Adding New Fonts
```js
// In ManualFlierDesignerConfig.js
FONT_OPTIONS: [
  // ... existing fonts
  { value: 'New Font Name', label: 'New Font Name' },
]
```

### Adding New Icons
```js
// In ManualFlierDesignerIcons.js
ICON_PATHS: {
  // ... existing icons
  newIcon: "M12,2C6.48,2 2,6.48 2,12S6.48,22 12,22 22,17.52 22,12 17.52,2 12,2Z",
}

// Then in Icons object:
NewIcon: ({ size, className, color }) =>
  createIcon(ICON_PATHS.newIcon, size, className, color),
```

### Using Icons in Component
```js
// Simple usage
<Icons.Download />

// With custom size and styling
<Icons.ArrowLeft size={32} className="custom-class" color="#ff0000" />

// Using the factory function
{createIcon(ICON_PATHS.settings, 20, "gear-icon", "#333")}
```

### Changing Default Values
```js
// In ManualFlierDesignerConfig.js
DEFAULTS: {
  titleSize: 50,        // Change default title size
  backgroundColor: '#f0f0f0',  // Change default background
  // ... other defaults
}
```

### Modifying Size Limits
```js
// In ManualFlierDesignerConfig.js
LIMITS: {
  titleSize: {
    min: 10,    // Smaller minimum
    max: 120,   // Larger maximum
    step: 2,    // Different step size
  }
}
```

### Adding New Languages
```js
// In ManualFlierDesignerConfig.js
TEXT_CONTENT: {
  // ... existing languages
  Spanish: {
    title: 'Título',
    text: 'Texto',
    // ... all text keys
  }
}
```

### Customizing Visual Layout
```js
// In ManualFlierDesignerConfig.js
CANVAS: {
  width: 800,   // Wider canvas
  height: 1000, // Taller canvas
  padding: 60,  // More padding
}
```

## Helper Functions

### `getTextContent(language, key)`
Gets localized text based on language and key.

### `formatText(text, replacements)`
Replaces placeholders in text with actual values.

### `createIcon(pathData, size, className, color)`
Creates an SVG icon component from path data.

## Usage Example

```js
// The component automatically uses the config
import { FLIER_DESIGNER_CONFIG, getTextContent } from './ManualFlierDesignerConfig';
import Icons from './ManualFlierDesignerIcons';

const config = FLIER_DESIGNER_CONFIG;
const t = (key) => getTextContent(language, key);

// Access any config value
const titleSize = config.DEFAULTS.titleSize;
const maxTitleSize = config.LIMITS.titleSize.max;
const localizedTitle = t('title');

// Use icons
<Icons.Download size={config.ICONS.buttonIconSize} />
```

## Benefits

✅ **Easy Customization**: Change settings without touching component code  
✅ **Clean Code**: No more long SVG paths cluttering the component  
✅ **Icon Management**: Centralized icon system with reusable components  
✅ **Type Safety**: All values in one place reduce errors  
✅ **Maintainability**: Clear separation of configuration and logic  
✅ **Extensibility**: Easy to add new features and options  
✅ **Internationalization**: Built-in multi-language support  
✅ **Documentation**: Self-documenting configuration structure  

## File Structure

```
ManualFlierDesigner/
├── ManualFlierDesigner.js       # Main component
├── ManualFlierDesigner.css      # Styles
├── ManualFlierDesignerConfig.js # Configuration
├── ManualFlierDesignerIcons.js  # Icon definitions
└── README.md                    # Documentation (THIS FILE)
```

## Icon Benefits

**Before (Messy):**
```jsx
<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
  <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" fill="currentColor"/>
</svg>
```

**After (Clean):**
```jsx
<Icons.Download />
```

---

**Developer Tip**: Always check the config files first when you need to customize the flier designer behavior! 