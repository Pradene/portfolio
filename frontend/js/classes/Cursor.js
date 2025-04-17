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
      this.emit("mouseleave", { clientX: e.clientX, clientY: e.clientY });
    });

    // Handle mouse entering the window
    document.addEventListener("mouseenter", (e) => {
      this.show();
      this.emit("mouseenter", { clientX: e.clientX, clientY: e.clientY });
    });

    // Handle mouse movement
    document.addEventListener("mousemove", (e) => {
      this.show();
      // Emit move event with position data
      this.emit("mousemove", {
        timestamp: Date.now(),
      });

      this.targetPosition.set(e.x, e.y);
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
    if (this.focusedElement) {
      const elementPosition = this.focusedElement.getPosition();
      const elementSize = this.focusedElement.getSize();
      const x =
        elementPosition.x + elementSize.width / 2 - this.targetPosition.x;
      const y =
        elementPosition.y + elementSize.height / 2 - this.targetPosition.y;

      this.element.children[0].style.transform = `translate3d(${x}px, ${y}px, 0) scale(0.75)`;
    } else {
      const dx = this.targetPosition.x - this.position.x;
      const dy = this.targetPosition.y - this.position.y;

      const dampFactor = 0.8;

      const offsetX = -dx * dampFactor;
      const offsetY = -dy * dampFactor;

      this.element.children[0].style.transform = `translate3d(${offsetX}px, ${offsetY}px, 0) scale(1)`;
    }
  }

  updatePosition() {
    if (
      this.position.x !== this.targetPosition.x ||
      this.position.y !== this.targetPosition.y
    ) {
      // Emit move event with position data
      this.emit("cursormove", {
        timestamp: Date.now(),
      });

      const easeFactor = 0.2;
      this.position.x = lerp(
        this.position.x,
        this.targetPosition.x,
        easeFactor
      );
      this.position.y = lerp(
        this.position.y,
        this.targetPosition.y,
        easeFactor
      );
    }
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

  /**
   * Shows the cursor element.
   */
  show() {
    this.element.classList.remove("hide");
    void this.element.offsetWidth;
    this.element.classList.add("show");
  }

  /**
   * Hides the cursor element.
   */
  hide() {
    this.element.classList.remove("show");
    void this.element.offsetWidth;
    this.element.classList.add("hide");
  }
}

export default Cursor;
