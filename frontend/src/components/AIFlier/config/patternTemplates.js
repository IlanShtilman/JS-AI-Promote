// Pattern templates for background patterns
// These can be used for flier backgrounds to add texture and visual interest

export const patternTemplates = {
  dots: {
    pattern: 'radial-gradient(#0002 1px, transparent 1px)',
    size: '12px 12px',
    name: 'Dots',
    description: 'Simple dot pattern for clean backgrounds'
  },
  grid: {
    pattern: 'linear-gradient(#0001 1px, transparent 1px), linear-gradient(90deg, #0001 1px, transparent 1px)',
    size: '20px 20px',
    name: 'Grid',
    description: 'Grid pattern for structured layouts'
  },
  diagonal: {
    pattern: 'repeating-linear-gradient(45deg, #0001 0, #0001 1px, transparent 0, transparent 8px)',
    size: '12px 12px',
    name: 'Diagonal Lines',
    description: 'Dynamic diagonal lines for modern feel'
  },
  lines: {
    pattern: 'linear-gradient(45deg, #0001 1px, transparent 1px)',
    size: '10px 10px',
    name: 'Lines',
    description: 'Simple line pattern for subtle texture'
  },
  circles: {
    pattern: 'radial-gradient(circle, #0002 2px, transparent 2px)',
    size: '20px 20px',
    name: 'Circles',
    description: 'Circle pattern for friendly, organic feel'
  }
};

export default patternTemplates; 