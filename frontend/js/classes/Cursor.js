import EventEmitter from "./EventEmitter.js";
import Focusable from "./Focusable.js";
import Position from "./Position.js";
import { lerp } from "../utils.js";

/**
 * A class to manage and update a custom cursor element.
 */
class Cursor extends EventEmitter {
  /**
   * Creates a new Cursor instance.
   * @param {HTMLElement} element - The HTML element to control (e.g., a div acting as a custom cursor).
   */
  constructor(element) {
    if (!(element instanceof HTMLElement)) {
      throw new Error("Cursor requires a valid HTMLElement.");
    }

    super();

    /** @private */
    /** @type {HTMLElement} */
    this.element = element;

    /**@private */
    /** @type {Position} */
    this.position = new Position(0, 0);

    /**@private */
    /** @type {Position} */
    this.targetPosition = new Position(0, 0);

    /** @private */
    /** @type {Focusable|null} */
    this.focusedElement = null;

    this.hide();
    this.initMouseEvents();
  }

  initMouseEvents() {
    document.addEventListener("mouseleave", (e) => {
      this.hide();
      this.emit("leave", { clientX: e.clientX, clientY: e.clientY });
    });

    // Handle mouse entering the window
    document.addEventListener("mouseenter", (e) => {
      this.show();
      this.emit("enter", { clientX: e.clientX, clientY: e.clientY });
    });

    // Handle mouse movement
    document.addEventListener("mousemove", (e) => {
      this.targetPosition.set(e.x, e.y);
      // Emit move event with position data
      this.emit("move", {
        clientX: e.clientX,
        clientY: e.clientY,
        timestamp: Date.now(),
      });
    });
  }

  /**
   * Get the position of the cursor
   * @returns {number, number} Position (x, y)
   */
  getPosition() {
    return { ...this.position.get() };
  }

  /**
   * Moves the cursor element to the specified position.
   * @param {number} x - The x (left) coordinate in pixels.
   * @param {number} y - The y (top) coordinate in pixels.
   */
  setPosition(x, y) {
    this.position.set(x, y);
  }

  updateInnerCursor() {
    const position = this.getPosition();

    if (this.focusedElement) {
      const elementPosition = this.focusedElement.getPosition();
      const elementSize = this.focusedElement.getSize();
      const x = elementPosition.x + elementSize.width / 2 - position.x;
      const y = elementPosition.y + elementSize.height / 2 - position.y;

      this.element.children[0].style.transform = `translate3d(${x}px, ${y}px, 0) scale(0.75)`;
    } else {
      const dx = this.targetPosition.x - position.x;
      const dy = this.targetPosition.y - position.y;

      // Optionally scale the movement to exaggerate or dampen it
      const easeFactor = 0.8;

      const offsetX = -dx * easeFactor;
      const offsetY = -dy * easeFactor;

      // You can scale down the inner cursor for a visual "depth" effect
      const scale = this.focusedElement ? 0.75 : 1;

      this.element.children[0].style.transform = `translate3d(${offsetX}px, ${offsetY}px, 0) scale(${scale})`;
    }
  }

  updatePosition() {
    const easeFactor = 0.2;
    this.position.x = lerp(this.position.x, this.targetPosition.x, easeFactor);
    this.position.y = lerp(this.position.y, this.targetPosition.y, easeFactor);
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
    this.updatePosition();
    this.updateInnerCursor();

    const position = this.getPosition();
    this.element.style.left = `${position.x}px`;
    this.element.style.top = `${position.y}px`;
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
}

export default Cursor;
