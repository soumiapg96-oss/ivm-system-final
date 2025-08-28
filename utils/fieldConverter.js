/**
 * Convert snake_case object keys to camelCase
 * @param {Object} obj - Object with snake_case keys
 * @returns {Object} - Object with camelCase keys
 */
function snakeToCamel(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(snakeToCamel);
  }

  const camelObj = {};
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = key.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
    
    // Convert numeric fields to proper types
    let convertedValue = snakeToCamel(value);
    if (typeof convertedValue === 'string' && !isNaN(convertedValue)) {
      // Check if it's a numeric string
      if (convertedValue.includes('.')) {
        convertedValue = parseFloat(convertedValue);
      } else {
        convertedValue = parseInt(convertedValue, 10);
      }
    }
    
    camelObj[camelKey] = convertedValue;
  }
  return camelObj;
}

/**
 * Convert camelCase object keys to snake_case
 * @param {Object} obj - Object with camelCase keys
 * @returns {Object} - Object with snake_case keys
 */
function camelToSnake(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(camelToSnake);
  }

  const snakeObj = {};
  for (const [key, value] of Object.entries(obj)) {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    snakeObj[snakeKey] = camelToSnake(value);
  }
  return snakeObj;
}

module.exports = {
  snakeToCamel,
  camelToSnake
};
