/**
 * Utility functions for working with car colors
 */

// Cache for color extraction to improve performance
const colorExtractionCache = new Map();

/**
 * Extract colors from a car slug
 * @param {string} slug - The car slug to extract colors from
 * @param {string} type - The type of color to extract ('exterior' or 'interior')
 * @returns {string[]} Array of extracted color names
 */
export const extractColorsFromSlug = (slug, type = 'exterior') => {
  if (!slug || typeof slug !== 'string') return [];
  
  // Use cache if available
  const cacheKey = `${slug}-${type}`;
  if (colorExtractionCache.has(cacheKey)) {
    return colorExtractionCache.get(cacheKey);
  }
  
  // Common color terms to look for in slugs
  const colorTerms = [
    'white', 'black', 'red', 'blue', 'green', 'yellow', 'orange', 'purple',
    'pink', 'brown', 'grey', 'gray', 'silver', 'gold', 'beige', 'tan',
    'maroon', 'navy', 'teal', 'olive', 'cyan', 'magenta', 'ivory', 'cream',
    'burgundy', 'turquoise', 'bronze', 'champagne', 'copper', 'crimson'
  ];
  
  // Convert slug to lowercase and replace hyphens and underscores with spaces
  const slugText = slug.toLowerCase().replace(/[-_]/g, ' ');
  
  // Identify interior vs exterior colors based on context clues in the slug
  const interiorColorPatterns = ['inside', 'interior', 'and'];
  const exteriorColorPatterns = ['body', 'roof', 'pearl', 'metallic', 'outside'];
  
  // Extract parts of slug text that likely contain interior or exterior color info
  let interiorPart = '';
  let exteriorPart = slugText;
  
  // Many slugs use 'inside' to denote interior colors
  if (slugText.includes('inside')) {
    const parts = slugText.split('inside');
    exteriorPart = parts[0]; // Everything before "inside" is exterior
    interiorPart = parts[1]; // Everything after "inside" is interior
  }
  
  // Find all color terms in the appropriate part of the slug
  let foundColors = [];
  
  if (type === 'interior' && interiorPart) {
    // Extract interior colors from the interior part of the slug
    foundColors = colorTerms.filter(color => 
      interiorPart.includes(color) || 
      interiorPart.includes(`${color} and`) ||
      interiorPart.includes(`and ${color}`)
    );
  } else if (type === 'exterior') {
    // For exterior, look for color terms with exterior indicators
    foundColors = colorTerms.filter(color => {
      // First check for explicit exterior markers
      if (exteriorPart.includes(`${color} body`) || 
          exteriorPart.includes(`body ${color}`) ||
          exteriorPart.includes(`${color} roof`) ||
          exteriorPart.includes(`roof ${color}`) ||
          exteriorPart.includes(`${color} metallic`) ||
          exteriorPart.includes(`metallic ${color}`) ||
          exteriorPart.includes(`${color} pearl`)) {
        return true;
      }
      
      // If no interior markers in slug, look for colors before any interior marker
      if (!interiorPart && exteriorPart.includes(color)) {
        return true;
      }
      
      // Check if color is in the exterior part but not close to interior indicators
      if (exteriorPart.includes(color)) {
        // Avoid detecting colors that are likely interior
        const isLikelyInteriorColor = interiorColorPatterns.some(pattern => 
          exteriorPart.includes(`${color} ${pattern}`) || 
          exteriorPart.includes(`${pattern} ${color}`)
        );
        
        return !isLikelyInteriorColor;
      }
      
      return false;
    });
  }
  
  // Get unique colors
  const uniqueColors = [...new Set(foundColors)];
  
  // Cache the result
  colorExtractionCache.set(cacheKey, uniqueColors);
  
  return uniqueColors;
};

/**
 * Create a filter function to match cars by their extracted colors
 * @param {string[]} targetColors - The colors to match against
 * @returns {Function} A filter function that takes a slug and returns true if colors match
 */
export const createColorMatchFunction = (targetColors) => {
  // Normalize colors for comparison
  const normalizedTargetColors = targetColors.map(color => color.toLowerCase().trim());
  
  return (slug) => {
    // If no target colors specified, don't filter
    if (!targetColors || targetColors.length === 0) {
      return true;
    }
    
    // Extract colors from the slug
    const extractedColors = extractColorsFromSlug(slug);
    
    // If no colors found in the slug, don't exclude it
    // Some cars might not have color in their slug but could match in other ways
    if (extractedColors.length === 0) {
      return true;
    }
    
    // Check if any of the extracted colors match our target colors
    const matchFound = extractedColors.some(extractedColor => 
      normalizedTargetColors.includes(extractedColor.toLowerCase().trim())
    );
    
    return matchFound;
  };
};

/**
 * Get the color name from a SpecificationValue object
 * @param {Object} car - The car object
 * @returns {string|null} The color name or null if not found
 */
export const getCarColorFromSpecs = (car) => {
  if (!car || !car.SpecificationValues) return null;
  
  const colorSpec = car.SpecificationValues.find(spec => 
    (spec.Specification && spec.Specification.key === 'color') ||
    (spec.specification && spec.specification.key === 'color')
  );
  
  return colorSpec ? colorSpec.name : null;
};

export default {
  extractColorsFromSlug,
  createColorMatchFunction,
  getCarColorFromSpecs
}; 