/**
 * @param {number} start -- Start value
 * @param {number} end -- end value
 * @param {number} t -- interpolation factor
 */
export const lerp = (start, end, t) => {
  return (1.0 - t) * start + t * end;
};
