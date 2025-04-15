import EventEmitter from "./EventEmitter.js";
import Focusable from "./Focusable.js";
import Position from "./Position.js";

/**
 * A class to manage and update a custom cursor element.
 */
class Cursor extends EventEmitter {
  /**
   * Creates a new Cursor instance.
   * @param {HTMLElement} element - The HTML element to control (e.g., a div acting as a custom cursor).
   */
  constructor(element) {
    super();

    if (!(element instanceof HTMLElement)) {
      throw new Error("Cursor requires a valid HTMLElement.");
    }

    /** @private */
    /** @type {HTMLElement} */
    this.element = element;

    /**@private */
    /** @type {Position} */
    this.position = new Position({ x: 0, y: 0 });

    /** @private */
    /** @type {Focusable|null} */
    this.focusedElement = null;

    this.hide();
    this.initMouseEvents();
  }

  initMouseEvents() {
    document.addEventListener("mouseleave", (e) => {
      this.hide();
      this.emit("leave", { x: e.clientX, y: e.clientY });
    });

    // Handle mouse entering the window
    document.addEventListener("mouseenter", (e) => {
      this.show();
      this.emit("enter", { x: e.clientX, y: e.clientY });
    });

    // Handle mouse movement
    document.addEventListener("mousemove", (e) => {
      // Emit move event with position data
      this.emit("move", {
        clientX: e.clientX,
        clientY: e.clientY,
        timestamp: Date.now(),
      });
    });
  }

  /**
   * Moves the cursor element to the specified position.
   * @param {number} x - The x (left) coordinate in pixels.
   * @param {number} y - The y (top) coordinate in pixels.
   */
  setTargetPosition(x, y) {
    this.position.setTargetPosition(x, y);
  }

  /**
   * Shows the cursor element.
   */
  show() {
    this.element.classList.remove("hide", "show");
    void this.element.offsetWidth;
    this.element.classList.add("show");
  }

  /**
   * Hides the cursor element.
   */
  hide() {
    this.element.classList.remove("show", "hide");
    void this.element.offsetWidth;
    this.element.classList.add("hide");
  }

  /**
   * Move cursor using lerp
   */
  update() {
    const position = this.position.update();
    this.element.style.left = `${position.x}px`;
    this.element.style.top = `${position.y}px`;

    if (this.focusedElement) {
      const currentPosition = this.getPosition();
      const elementPosition = this.focusedElement.getPosition();
      const elementSize = this.focusedElement.getSize();

      const x = elementPosition.x + elementSize.width / 2 - currentPosition.x;
      const y = elementPosition.y + elementSize.height / 2 - currentPosition.y;

      this.element.children[0].style.transform = `translate3d(${x}px, ${y}px, 0)`;
    } else {
      this.element.children[0].style.transform = `translate3d(0, 0, 0)`;
    }
  }

  /**
   * @param {Focusable} element
   */
  setFocusedElement(element) {
    this.focusedElement = element;
  }

  clearFocusedElement() {
    this.focusedElement = null;
  }

  /**
   * Get the position of the cursor
   * @returns {number, number} Position (x, y)
   */
  getPosition() {
    return { ...this.position.getPosition() };
  }
}

export default Cursor;
