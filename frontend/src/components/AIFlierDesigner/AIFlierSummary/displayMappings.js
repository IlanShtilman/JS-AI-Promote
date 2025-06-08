/**
 * Display mappings for AIFlierSummary component
 * Centralizes all UI label mappings for better maintainability
 */

export const DISPLAY_MAPPINGS = {
  stylePreference: {
    'modern': 'Modern - מודרני',
    'classic': 'Classic - קלאסי',
    'minimalist': 'Minimalist - מינימליסטי',
    'bold': 'Bold - נועז'
  },
  colorScheme: {
    'warm': 'Warm - חם',
    'cool': 'Cool - קר',
    'neutral': 'Neutral - ניטרלי',
    'vibrant': 'Vibrant - תוסס',
    'black': 'Black - שחור',
    'white': 'White - לבן',
    'blue': 'Blue - כחול',
    'red': 'Red - אדום',
    'green': 'Green - ירוק',
    'yellow': 'Yellow - צהוב',
    'purple': 'Purple - סגול',
    'orange': 'Orange - כתום',
    'brown': 'Brown - חום',
    'gray': 'Gray - אפור'
  }
};

/**
 * Helper function to get display value for a given key-value pair
 * @param {string} key - The mapping category (e.g., 'stylePreference', 'colorScheme')
 * @param {string} value - The value to map
 * @returns {string} - The display value or original value if no mapping exists
 */
export const getDisplayValue = (key, value) => {
  if (DISPLAY_MAPPINGS[key] && DISPLAY_MAPPINGS[key][value]) {
    return DISPLAY_MAPPINGS[key][value];
  }
  return value;
}; 