// Layout Engine - Handles layout decisions independent of AI
// Provides a robust fallback when AI suggestions aren't available

// Pattern templates for decorative backgrounds
export const patternTemplates = {
  dots: {
    pattern: 'radial-gradient(#00000010 1px, transparent 1px)',
    size: '20px 20px'
  },
  grid: {
    pattern: 'linear-gradient(to right, #00000008 1px, transparent 1px), linear-gradient(to bottom, #00000008 1px, transparent 1px)',
    size: '20px 20px'
  },
  diagonal: {
    pattern: 'repeating-linear-gradient(45deg, #00000008, #00000008 1px, transparent 1px, transparent 10px)',
    size: '20px 20px'
  },
  waves: {
    pattern: 'repeating-radial-gradient(ellipse at 50% 50%, #00000000, #00000008 10px, #00000000 15px)',
    size: '20px 20px'
  },
  confetti: {
    pattern: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z\' fill=\'%2399999920\' fill-opacity=\'0.1\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")',
    size: '150px 150px'
  }
};

// Gradient templates for backgrounds
export const gradientTemplates = {
  warm: 'linear-gradient(135deg, #fff8f0 0%, #ffebe0 100%)',
  cool: 'linear-gradient(135deg, #f0f8ff 0%, #e0f0ff 100%)',
  sunset: 'linear-gradient(135deg, #fff6e5 0%, #ffd6cc 100%)',
  mint: 'linear-gradient(135deg, #f0fff4 0%, #dcf5e8 100%)',
  lavender: 'linear-gradient(135deg, #f8f0ff 0%, #ebe0ff 100%)'
};

// Store decision logs for debugging
export const engineLogs = [];

// Log engine decisions for debugging
const logDecision = (category, decision, reason) => {
  const log = {
    timestamp: new Date().toISOString(),
    category,
    decision,
    reason
  };
  
  engineLogs.push(log);
  console.log(`Layout Engine [${category}]: ${decision} - ${reason}`);
  
  // Keep log size manageable
  if (engineLogs.length > 50) {
    engineLogs.shift();
  }
  
  return decision; // Return for convenient chaining
};

// Main layout generation function
export function generateLayout(flierData) {
  console.log("🚀 Layout Engine Starting - Generating layout from data:", flierData);
  engineLogs.length = 0; // Clear previous logs
  
  // Default configuration - fallback if no specific rules match
  const layoutConfig = {
    layout: "standard",
    elementPositions: {
      image: { x: 50, y: 40 }
    },
    colorApplications: {
      background: "#ffffff",
      title: "#000000", 
      promotionalText: "#333333"
    },
    fontSelections: {
      title: "Heebo",
      promotionalText: "Assistant"
    },
    patternType: 'none',
    gradientType: 'none',
    gridSize: '3x3', // Default grid size
    template: 'modern', // Default template
  };
  
  // Continue with deterministic rules (Apply these first)

  // Apply color scheme based on input
  if (flierData.colorScheme) {
    switch (flierData.colorScheme) {
      case "warm":
        layoutConfig.colorApplications.background = logDecision(
          "Color", "#fff8f0", "Applied warm color scheme background"
        );
        layoutConfig.colorApplications.title = logDecision(
          "Color", "#773311", "Applied warm color scheme title"
        );
        layoutConfig.gradientType = logDecision(
          "Gradient", "warm", "Applied warm gradient for warm color scheme"
        );
        break;
      case "cool":
        layoutConfig.colorApplications.background = logDecision(
          "Color", "#f0f8ff", "Applied cool color scheme background"
        );
        layoutConfig.colorApplications.title = logDecision(
          "Color", "#115577", "Applied cool color scheme title"
        );
        layoutConfig.gradientType = logDecision(
          "Gradient", "cool", "Applied cool gradient for cool color scheme"
        );
        break;
      default:
        logDecision("Color", "default", `Color scheme '${flierData.colorScheme}' not recognized, using defaults`);
        break;
    }
  } else {
    logDecision("Color", "default", "No color scheme specified, using defaults");
  }
  
  // Apply business-specific styling
  if (flierData.businessType) {
    switch (flierData.businessType) {
      case "cafe":
        layoutConfig.colorApplications.background = logDecision(
          "Business", "#fff8f0", "Applied cafe-specific background color"
        );
        layoutConfig.colorApplications.title = logDecision(
          "Business", "#5d4037", "Applied cafe-specific title color"
        );
        break;
      case "tech":
        layoutConfig.colorApplications.background = logDecision(
          "Business", "#e8f0fe", "Applied tech-specific background color"
        );
        layoutConfig.colorApplications.title = logDecision(
          "Business", "#1a73e8", "Applied tech-specific title color"
        );
        break;
      case "restaurant":
        layoutConfig.colorApplications.background = logDecision(
          "Business", "#fff3e0", "Applied restaurant-specific background color"
        );
        layoutConfig.colorApplications.title = logDecision(
          "Business", "#e65100", "Applied restaurant-specific title color"
        );
        break;
      default:
        logDecision("Business", "default", `Business type '${flierData.businessType}' not specifically handled, using defaults`);
        break;
    }
  } else {
    logDecision("Business", "default", "No business type specified, using defaults");
  }
  
  // Apply audience-specific styling
  if (flierData.targetAudience) {
    switch (flierData.targetAudience) {
      case "families":
        layoutConfig.fontSelections.title = logDecision(
          "Audience", "Rubik", "Applied family-friendly title font"
        );
        layoutConfig.fontSelections.promotionalText = logDecision(
          "Audience", "Assistant", "Applied family-friendly promotional text font"
        );
        break;
      case "professionals":
        layoutConfig.fontSelections.title = logDecision(
          "Audience", "Arial", "Applied professional title font"
        );
        layoutConfig.fontSelections.promotionalText = logDecision(
          "Audience", "Arial", "Applied professional promotional text font"
        );
        break;
      case "youth":
        layoutConfig.fontSelections.title = logDecision(
          "Audience", "Rubik", "Applied youth-oriented title font"
        );
        layoutConfig.fontSelections.promotionalText = logDecision(
          "Audience", "Heebo", "Applied youth-oriented promotional text font"
        );
        break;
      default:
        logDecision("Audience", "default", `Target audience '${flierData.targetAudience}' not specifically handled, using defaults`);
        break;
    }
  } else {
    logDecision("Audience", "default", "No target audience specified, using defaults");
  }
  
  // Apply style preference for patterns and decorative elements
  if (flierData.stylePreference) {
    switch (flierData.stylePreference) {
      case "modern":
        layoutConfig.patternType = logDecision(
          "Style", "grid", "Applied grid pattern for modern style"
        );
        break;
      case "playful":
        layoutConfig.patternType = logDecision(
          "Style", "dots", "Applied dots pattern for playful style"
        );
        break;
      // Add more styles as needed
      default:
        logDecision("Style", "default", `Style preference '${flierData.stylePreference}' not specifically handled, using defaults`);
        break;
    }
  } else {
    logDecision("Style", "default", "No style preference specified, using defaults");
  }
  
  // Process AI suggestions if available (Apply these last to override deterministic rules)
  if (flierData.aiSuggestions) {
    logDecision("AI", "suggestions", "Processing AI styling suggestions");
    
    // Process layout suggestions
    if (flierData.aiSuggestions.layout) {
      layoutConfig.layout = logDecision(
        "AI", flierData.aiSuggestions.layout, "Applied AI-suggested layout"
      );
    }
    
    // Process element positions
    if (flierData.aiSuggestions.elementPositions) {
      // Selectively apply positions while ensuring they're valid
      Object.entries(flierData.aiSuggestions.elementPositions).forEach(([element, position]) => {
        if (typeof position === 'object' && position !== null) {
          const x = typeof position.x === 'number' ? position.x : layoutConfig.elementPositions[element]?.x || 50;
          const y = typeof position.y === 'number' ? position.y : layoutConfig.elementPositions[element]?.y || 50;
          layoutConfig.elementPositions[element] = { x, y };
          logDecision("AI", `${element} at (${x}, ${y})`, "Applied AI-suggested position");
        }
      });
    }
    
    // **Replace the entire colorApplications object with AI suggestions**
    if (flierData.aiSuggestions.colorApplications) {
       layoutConfig.colorApplications = logDecision(
          "AI", flierData.aiSuggestions.colorApplications, "Applied AI-suggested color applications (overriding deterministic rules)"
      );
    }
    
    // Process font suggestions
    if (flierData.aiSuggestions.fontSelections) {
      // Apply font suggestions if they're valid strings
      Object.entries(flierData.aiSuggestions.fontSelections).forEach(([element, font]) => {
        if (typeof font === 'string' && font.trim()) {
          // Check if the key exists before attempting to update
          if (layoutConfig.fontSelections.hasOwnProperty(element)) {
             layoutConfig.fontSelections[element] = logDecision(
              "AI", font, `Applied AI-suggested ${element} font (overriding deterministic rule)`
            );
          } else {
             logDecision(
              "AI", font, `Skipped applying AI-suggested ${element} font (key not in default config)`
            );
          }
        }
      });
    }
    
    // Process design rationale
    if (flierData.aiSuggestions.designRationale) {
      // Store the rationale for reference
      layoutConfig.designRationale = flierData.aiSuggestions.designRationale;
      logDecision("AI", "designRationale", "Saved AI design rationale");
    }
  } else {
    logDecision("AI", "none", "No AI suggestions available, using deterministic rules only");
  }
  
  // Final configuration adjustments or logging
  console.log("✅ Layout Engine Complete - Generated configuration:", layoutConfig);
  layoutConfig.engineLogs = [...engineLogs]; // Attach logs for debugging
  return layoutConfig;
}

// Generate multiple style options based on AI suggestions or fallback
export function generateStyleOptions(flierData) {
  // Get the base configuration first (includes deterministic rules and processed AI suggestions)
  const baseConfig = generateLayout(flierData);
  
  // Use AI suggestions if available and in the expected format
  if (baseConfig && baseConfig.aiSuggestions && Array.isArray(baseConfig.aiSuggestions) && baseConfig.aiSuggestions.length > 0) {
    console.log("Layout Engine: Using AI-generated style options.");
    return baseConfig.aiSuggestions;
  } else if (baseConfig && baseConfig.aiSuggestions && Array.isArray(baseConfig.aiSuggestions.styles) && baseConfig.aiSuggestions.styles.length > 0) {
     // Handle case where AI suggestions might be nested under a 'styles' key (based on previous data structures)
     console.log("Layout Engine: Using AI-generated style options from 'styles' key.");
     return baseConfig.aiSuggestions.styles;
  } else {
    console.log("Layout Engine: No valid AI suggestions found, generating default fallback styles.");
    // Fallback: Generate a few simple default styles if AI suggestions are not available or invalid
    const defaultColors = { background: '#ffffff', textColor: '#000000', accent: '#FFA726', highlight: '#F1C40F' };
    return [
        { // Default Style 1 (Solid + Grid)
          background: { type: 'solid', color: defaultColors.background, gradient: null },
          textColor: defaultColors.textColor,
          accentColor: defaultColors.accent,
          highlightColor: defaultColors.highlight,
      pattern: 'grid',
      backgroundImage: 'none',
          designRationale: 'Default fallback style 1 (Solid + Grid)'
        },
        { // Default Style 2 (Gradient)
          background: { type: 'gradient', gradient: 'linear-gradient(135deg, #ffffff 0%, #cccccc 100%)', color: null },
          textColor: defaultColors.textColor,
          accentColor: defaultColors.accent,
          highlightColor: defaultColors.highlight,
          pattern: 'none',
      backgroundImage: 'none',
          designRationale: 'Default fallback style 2 (Gradient)'
        },
        { // Default Style 3 (Solid)
          background: { type: 'solid', color: defaultColors.background, gradient: null },
          textColor: defaultColors.textColor,
          accentColor: defaultColors.accent,
          highlightColor: defaultColors.highlight,
      pattern: 'none',
      backgroundImage: 'none',
          designRationale: 'Default fallback style 3 (Solid)'
        }
    ];
  }
} 