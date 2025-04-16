import { lerp } from "../utils.js";

/**
 * Class to manage and smoothly update the position of an element.
 */
class Position {
  /**
   * Creates a new Position instance with initial position values.
   * @param {number} initialPos.x - Initial x (left) position in pixels.
   * @param {number} initialPos.y - Initial y (top) position in pixels.
   */
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  /**
   * Sets the target position for the element to smoothly move towards.
   * @param {number} x - Target x (left) position.
   * @param {number} y - Target y (top) position.
   */
  set(x, y) {
    this.x = x;
    this.y = y;
  }

  /**
   * Gets the current position of the element.
   * @returns {{ x: number, y: number }} Current position.
   */
  get() {
    return { x: this.x, y: this.y };
  }
}

export default Position;
