import EventEmitter from "./EventEmitter.js";
import Focusable from "./Focusable.js";

/**
 * Manages switching between mouse and keyboard input modes and
 * handles navigation between focusable elements.
 */
class InputManager extends EventEmitter {
  /**
   * @param {Object} cursor - A custom cursor instance with setTargetPosition(), getPosition(), and runAnimation().
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

    /** @type {{x: number, y: number}} */
    this.actualMousePosition = { x: 0, y: 0 };

    /** @type {Focusable|null} */
    this.focusedElement = null;

    /** @type {number} */
    this.SNAP_DISTANCE = 24;

    /** @type {number} */
    this.UNSNAP_DISTANCE = 36;

    this.initListeners();
  }

  /**
   * Sets up mouse and keyboard event listeners.
   */
  initListeners() {
    this.cursor.on("move", (e) => this.handleMouse(e));

    document.addEventListener("keydown", (e) => {
      this.handleInput(e);
      this.emit("input", { key: e.key });
    });
  }

  handleInput(event) {
    if (event.key === "Escape") {
      // Allow escape key to clear focus
      this.clearFocus();
      this.cursor.setTargetPosition(
        this.actualMousePosition.x,
        this.actualMousePosition.y
      );
    } else {
      this.setMode("keyboard");
      this.navigate(event.key);
    }
  }

  handleMouse(event) {
    this.setMode("mouse");

    // Always track the actual mouse position
    this.actualMousePosition = { x: event.clientX, y: event.clientY };

    // Check if we need to completely exit focus due to large movement
    if (this.focusedElement) {
      const focusedPos = this.focusedElement.getPosition();
      const distFromFocused = Math.hypot(
        event.clientX - focusedPos.x,
        event.clientY - focusedPos.y
      );

      // If mouse is very far from focused element, clear focus
      if (distFromFocused > this.UNSNAP_DISTANCE) {
        this.clearFocus();
        this.cursor.setTargetPosition(event.clientX, event.clientY);
        return;
      }
    }

    const nearest = this.getNearestFocusable(event.clientX, event.clientY);
    this.cursor.setTargetPosition(event.clientX, event.clientY);

    if (nearest) {
      const dist = this.distanceTo(nearest);

      if (dist < this.SNAP_DISTANCE) {
        // Get the focused element
        const newFocusedElement = this.getFocusableAtPosition(nearest);

        // If we found a new focusable, set it as focused
        if (newFocusedElement && newFocusedElement !== this.focusedElement) {
          this.setFocusedElement(newFocusedElement);
        }
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

    this.currentIndex = this.focusables.indexOf(element);
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
      console.log("Switched to", mode, "mode");
    }
  }

  /**
   * Finds the nearest focusable element to the given coordinates.
   * @param {number} x
   * @param {number} y
   * @returns {{x: number, y: number} | null}
   */
  getNearestFocusable(x, y) {
    let nearest = null;
    let minDist = Infinity;

    this.focusables.forEach((f) => {
      let center = f.getPosition();

      const dx = x - center.x;
      const dy = y - center.y;
      const dist = Math.hypot(dx, dy);

      if (dist < minDist) {
        minDist = dist;
        nearest = { x: center.x, y: center.y };
      }
    });

    return nearest;
  }

  /**
   * Finds which focusable is at the given position
   * @param {{x: number, y: number}} position
   * @returns {Focusable|null}
   */
  getFocusableAtPosition(position) {
    for (let i = 0; i < this.focusables.length; i++) {
      const focusablePos = this.focusables[i].getPosition();
      // Using a small threshold for position matching
      if (
        Math.abs(focusablePos.x - position.x) < 2 &&
        Math.abs(focusablePos.y - position.y) < 2
      ) {
        return this.focusables[i];
      }
    }
    return null;
  }

  /**
   * Computes the distance from the cursor to a given position.
   * @param {{x: number, y: number}} pos
   * @returns {number}
   */
  distanceTo(pos) {
    const current = this.cursor.getPosition();
    return Math.hypot(pos.x - current.x, pos.y - current.y);
  }

  /**
   * Moves to the next or previous focusable element depending on the key.
   * @param {'ArrowRight' | 'ArrowLeft' | 'Tab'} key
   */
  navigate(key) {
    if (key === "ArrowRight" || key === "Tab") {
      this.currentIndex = (this.currentIndex + 1) % this.focusables.length;
      this.setFocusedElement(this.focusables[this.currentIndex]);
    } else if (key === "ArrowLeft") {
      this.currentIndex =
        (this.currentIndex - 1 + this.focusables.length) %
        this.focusables.length;
      this.setFocusedElement(this.focusables[this.currentIndex]);
    } else {
      const ids = [];
      this.focusables.forEach((focusable) => {
        let id = focusable.getIdentifier().toString();
        ids.push(id);
      });

      const findIndexById = (targetId) => {
        // Find the index where the identifier matches the target ID
        const index = ids.findIndex(id => id === targetId);
        
        // If found, set as current element
        if (index !== -1) {
          this.currentIndex = index;
          this.setFocusedElement(this.focusables[this.currentIndex]);
          return 1;
        }
        
        // If not found
        return 0;
      }
      
      // Example usage
      const targetId = key;
      const foundIndex = findIndexById(targetId);
      
      if (foundIndex !== 1) {
        this.removeFocus();
      }
    }
  }
}

export default InputManager;
