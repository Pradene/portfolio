import EventEmitter from "./EventEmitter.js";
import Focusable from "./Focusable.js";

/**
 * Manages switching between mouse and keyboard input modes and
 * handles navigation between focusable elements.
 */
class InputManager extends EventEmitter {
  /**
   * @param {Object} cursor - A custom cursor instance
   * @param {Array<Focusable>} focusables - List of focusable element instances.
   */
  constructor(cursor, focusables) {
    super();

    /** @type {'mouse' | 'keyboard'} */
    this.mode = "mouse";

    /** @type {Object} */
    this.cursor = cursor;

    /** @type {Array<Focusable>} */
    this.focusables = focusables;

    /** @type {number} */
    this.currentIndex = 0;

    /** @type {Focusable|null} */
    this.focusedElement = null;

    this.initListeners();
  }

  /**
   * Sets up mouse and keyboard event listeners.
   */
  initListeners() {
    this.cursor.on("mousemove", () => this.setMode("mouse"));
    this.cursor.on("cursormove", () => this.handleCursorMove());

    document.addEventListener("keydown", (e) => {
      this.handleInput(e);
      this.emit("input", { key: e.key });
    });
  }

  /**
   * Handle keyboard event
   * @param {KeyboardEvent} event
   */
  handleInput(event) {
    // console.log(event.key);
    if (event.key === "Escape") {
      // Allow escape key to clear focus
      this.clearFocus();
    } else if (event.key == "Enter") {
      if (this.focusedElement) {
        console.log(this.focusedElement);
      }
    } else {
      this.setMode("keyboard");
      this.navigate(event.key);
    }
  }

  /**
   * Checks if a point is inside a focusable element's bounding box
   * @param {number} x - Cursor X position
   * @param {number} y - Cursor Y position
   * @param {Focusable} focusable - Focusable element to check
   * @returns {boolean} - True if point is inside the element's bounds
   */
  isPointInElement(x, y, focusable) {
    const rect = focusable.element.getBoundingClientRect();
    return (
      x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom
    );
  }

  /**
   * Handle cursor movement
   */
  handleCursorMove() {
    const position = this.cursor.getPosition();
    const element = this.getFocusableAtPoint(position.x, position.y);

    // If cursor is inside an element and it's different from current focus
    if (element && element !== this.focusedElement) {
      this.setFocusedElement(element);
    }
    // If no element found and we have focus, check if we should clear it
    else if (!element && this.focusedElement) {
      // Clear focus only if cursor is outside the focused element
      if (!this.isPointInElement(position.x, position.y, this.focusedElement)) {
        this.clearFocus();
      }
    }
  }

  /**
   * Sets focus to a new element and tells the cursor to animate
   * @param {Focusable} element
   */
  setFocusedElement(element) {
    // Clear previous focus if any
    if (this.focusedElement && this.focusedElement !== element) {
      this.clearFocus();
    }

    this.focusedElement = element;
    this.focusedElement.element.classList.add("focused");
    // Call onFocus method if the element has one
    this.focusedElement.onFocus?.();

    this.cursor.setFocusedElement(this.focusedElement);

    this.currentIndex = this.focusables.indexOf(this.focusedElement);
  }

  /**
   * @returns {HTMLElement | null}
   */
  getFocusedElement() {
    return this.focusedElement;
  }

  /**
   * Clears the current focus
   */
  clearFocus() {
    if (this.focusedElement) {
      this.cursor.clearFocusedElement();
      this.focusedElement.removeFocus();
      this.focusedElement.onBlur?.();
      this.focusedElement = null;
    }
  }

  /**
   * Updates the current input mode.
   * @param {'mouse' | 'keyboard'} mode
   */
  setMode(mode) {
    if (this.mode !== mode) {
      this.mode = mode;
      this.emit("modechange", {
        mode: this.mode,
      });
      console.log("Switched to", mode, "mode");
    }
  }

  /**
   * Finds the focusable element at the given coordinates, or null if none.
   * @param {number} x
   * @param {number} y
   * @returns {Focusable | null}
   */
  getFocusableAtPoint(x, y) {
    for (const focusable of this.focusables) {
      if (this.isPointInElement(x, y, focusable)) {
        return focusable;
      }
    }

    return null;
  }

  /**
   * Moves to the next or previous focusable element depending on the key.
   * @param {'ArrowRight' | 'ArrowLeft' | 'Tab'} key
   */
  navigate(key) {
    if (key === "ArrowRight" || key === "Tab") {
      const index = (this.currentIndex + 1) % this.focusables.length;
      this.setFocusedElement(this.focusables[index]);
    } else if (key === "ArrowLeft") {
      const index =
        (this.currentIndex - 1 + this.focusables.length) %
        this.focusables.length;
      this.setFocusedElement(this.focusables[index]);
    } else {
      const ids = [];
      this.focusables.forEach((focusable) => {
        let id = focusable.getIdentifier().toString();
        ids.push(id);
      });

      // Find the index where the identifier matches the target ID
      const index = ids.findIndex((id) => id === key);

      // If found, set as current element
      if (index !== -1) {
        this.setFocusedElement(this.focusables[index]);
      }
    }
  }
}

export default InputManager;
