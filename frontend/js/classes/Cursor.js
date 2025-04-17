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

    /**@private */
    /** @type {Position} */
    this.innerPosition = new Position(0, 0);

    /**@private */
    /** @type {Position} */
    this.innerTargetPosition = new Position(0, 0);

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

  /**
   * Updates the target position for the inner cursor based on current context
   */
  updateInnerTargetPosition() {
    if (this.focusedElement) {
      // When focused on an element, calculate target position relative to the focused element
      const elementPosition = this.focusedElement.getPosition();
      const elementSize = this.focusedElement.getSize();
      const x = elementPosition.x + elementSize.width / 2 - this.position.x;
      const y = elementPosition.y + elementSize.height / 2 - this.position.y;

      this.innerTargetPosition.set(x, y);
    } else {
      // When not focused, calculate the dampened inverse movement
      const dx = this.targetPosition.x - this.position.x;
      const dy = this.targetPosition.y - this.position.y;

      const dampFactor = 0.8;
      const offsetX = -dx * dampFactor;
      const offsetY = -dy * dampFactor;

      this.innerTargetPosition.set(offsetX, offsetY);
    }
  }

  updateInnerCursor() {
    // Update inner position with smooth lerp
    const innerEaseFactor = 0.2; // Adjust this value for inner cursor smoothness
    this.innerPosition.x = lerp(
      this.innerPosition.x,
      this.innerTargetPosition.x,
      innerEaseFactor
    );
    this.innerPosition.y = lerp(
      this.innerPosition.y,
      this.innerTargetPosition.y,
      innerEaseFactor
    );

    // Calculate scale based on whether we're focused or not
    const scale = this.focusedElement ? 0.75 : 1;

    // Apply the transform
    this.element.children[0].style.transform = `translate3d(${this.innerPosition.x}px, ${this.innerPosition.y}px, 0) scale(${scale})`;
  }

  updatePosition() {
    if (
      this.position.x !== this.targetPosition.x ||
      this.position.y !== this.targetPosition.y
    ) {
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

      this.updateInnerTargetPosition();

      // Emit move event with position data
      this.emit("cursormove", {
        timestamp: Date.now(),
      });
    }
  }

  updateCursor() {
    this.element.style.transform = `translate3d(calc(${this.position.x}px - 50%), calc(${this.position.y}px - 50%), 0)`;
  }

  /**
   * Move cursor using lerp
   */
  update() {
    this.updatePosition();
    this.updateCursor();
    this.updateInnerCursor();
  }

  /**
   * @param {Focusable} element
   */
  setFocusedElement(element) {
    this.focusedElement = element;
    this.updateInnerTargetPosition(); // Update inner target when focus changes
  }

  clearFocusedElement() {
    this.focusedElement = null;
    this.updateInnerTargetPosition(); // U65554444pdate inner target when focus changes
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
