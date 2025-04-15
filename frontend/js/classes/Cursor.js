import Position from "./Position.js"

/**
 * A class to manage and update a custom cursor element.
 */
class Cursor {
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
    this.position = new Position({ x: 0, y: 0 })

    this.animationFrameId = null
    this.isAnimating = false
    this.isAnimating = false
    this.hide()
  }
  
  /**
   * Moves the cursor element to the specified position.
   * @param {number} x - The x (left) coordinate in pixels.
   * @param {number} y - The y (top) coordinate in pixels.
   */
  setTargetPosition(x, y) {
    this.position.setTargetPosition(x, y)
  }

  setTranslate(x, y) {
    if (!this.element || !this.element.children[0]) {
      throw new Error("Cursor requires a valid HTMLElement.")
    }

    this.element.children[0].style.transform = `translate3(${x}, ${y}, 0)`
  }
  
  /**
   * Shows the cursor element.
   */
  show() {
    this.element.classList.remove("hide", "show")
    void this.element.offsetWidth
    this.element.classList.add("show")
  }
  
  /**
   * Hides the cursor element.
   */
  hide() {
    this.element.classList.remove("show", "hide")
    void this.element.offsetWidth
    this.element.classList.add("hide")
  }

  /**
   * Move cursor using lerp
   */
  update() {
    const position = this.position.update()
    this.element.style.left = `${position.x}px`
    this.element.style.top = `${position.y}px`
  }

  /**
   * Get the position of the cursor
   * @returns {number, number} Position (x, y)
   */
  getPosition() {
    return { ...this.position.getPosition() }
  }
}

export default Cursor