import Position from "./Position.js"
import {lerp} from "../utils.js"

/**
 * A class to manage focus element
 */
class Focusable {
  /**
   * Creates a new Cursor instance.
   * @param {HTMLElement} element - The HTML element to control (e.g., a div acting as a custom cursor).
   */
  constructor(element) {
    if (!(element instanceof HTMLElement)) {
      throw new Error("Cursor requires a valid HTMLElement.")
    }
    
    /** @private */
    this.element = element
    const rect = this.element.getBoundingClientRect()
    
    const x = lerp(rect.right, rect.left, 0.5)
    const y = lerp(rect.top, rect.bottom, 0.5)

    this.position = new Position({ x, y})
  }

  /**
   * Get position
   * @returns {number, number} Position (x, y)
   */
  getPosition() {
    return { ...this.position.getPosition() }
  }

  /**
   * Get size
   * @returns {number, number} Size (width, height)
   */
  getSize() {
    const rect = this.element.getBoundingClientRect();
    const { width, height } = rect;
    return { width, height };
  }

  /**
   * Get max size between width and height
   * @returns {number} Max size
   */
  getMaxSize() {
    const size = this.getSize()
    return (size.width > size.height) ? size.width : size.height
  }

  /**
   * Add focus to element
   */
  addFocus() {
    this.element.classList.add("focused")
  }
  
  /**
   * Remove focus of element
   */
  removeFocus() {
    this.element.classList.remove("focused")
  }
}

export default Focusable