import Position from "./Position.js";
import { lerp } from "../utils.js";


/**
 * Create a child div with an id to fzf
 * @param {HTMLElement} element 
*/
const createIdentifier = (element,id) => {
  const container = document.createElement("span");
  container.classList.add("fzf-id");
  container.innerText = id;
  
  element.appendChild(container);
}

let ID = 0;
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
      throw new Error("Cursor requires a valid HTMLElement.");
    }

    /** @private */
    /** @type {HTMLElement} */
    this.element = element;

    /** @private */
    /** @type {Position} */
    this.position = this.getPosition();

    this.id = ID++

    createIdentifier(this.element, this.id);
  }

  /**
   * Get window position 
   * @returns {number, number} Position (x, y)
   */
  getPosition() {
    const rect = this.element.getBoundingClientRect();
    const x = lerp(rect.right, rect.left, 0.5);
    const y = lerp(rect.top, rect.bottom, 0.5);
    return { x, y };
  }

  /**
   * Get id
   * @returns {number} id
   */
  getIdentifier() {
    return this.id;
  }

  /**
   * Update the position 
   */
  updatePosition() {
    this.position = this.getPosition();
  }

  /**
   * Update
   */
  update() {
    this.updatePosition();
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
    const size = this.getSize();
    return size.width > size.height ? size.width : size.height;
  }

  /**
   * Add focus to element
   */
  addFocus() {
    this.element.classList.add("focused");
  }

  /**
   * Remove focus of element
   */
  removeFocus() {
    this.element.classList.remove("focused");
  }
}

export default Focusable;
