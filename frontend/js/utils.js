/**
 * @param {number} start -- Start value
 * @param {number} end -- end value
 * @param {number} t -- interpolation factor
 */
export const lerp = (start, end, t, epsilon = 0.0001) => {
  const result = start + t * (end - start);
  // If we're very close to the target, just snap to it
  if (Math.abs(result - end) < epsilon) {
    return end;
  } else {
    return result;
  }
};
