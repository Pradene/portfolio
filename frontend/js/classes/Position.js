import { lerp } from "../utils.js";

/**
 * Class to manage and smoothly update the position of an element.
 */
class Position {
  /**
   * Creates a new Position instance with initial position values.
   * @param {Object} initialPos - Initial position values.
   * @param {number} initialPos.x - Initial x (left) position in pixels.
   * @param {number} initialPos.y - Initial y (top) position in pixels.
   */
  constructor(initialPos = { x: 0, y: 0 }) {
    /** @private */
    this.currentPos = { x: initialPos.x, y: initialPos.y };

    /** @private */
    this.targetPos = { x: initialPos.x, y: initialPos.y };

    /** @private */
    this.easeFactor = 0.2; // Controls the lerp speed (0 = instant, 1 = no movement)
  }

  /**
   * Sets the target position for the element to smoothly move towards.
   * @param {number} x - Target x (left) position.
   * @param {number} y - Target y (top) position.
   */
  setTargetPosition(x, y) {
    this.targetPos = { x, y };
  }

  /**
   * Updates the position of the element using linear interpolation (lerp).
   * @returns {{ x: number, y: number }} Updated position.
   */
  update() {
    this.currentPos.x = lerp(
      this.currentPos.x,
      this.targetPos.x,
      this.easeFactor
    );
    this.currentPos.y = lerp(
      this.currentPos.y,
      this.targetPos.y,
      this.easeFactor
    );
    return { ...this.currentPos }; // Return current position after update
  }

  /**
   * Gets the current position of the element.
   * @returns {{ x: number, y: number }} Current position.
   */
  getPosition() {
    return { ...this.currentPos };
  }
}

export default Position;
