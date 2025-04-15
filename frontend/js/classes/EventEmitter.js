/**
 * A simple event emitter implementation to handle custom events.
 */
class EventEmitter {
  constructor() {
    /** @private */
    this.events = {};
  }

  /**
   * Subscribe to an event
   * @param {string} event - The event name
   * @param {Function} callback - The callback function to execute when the event is emitted
   * @returns {Function} - Unsubscribe function
   */
  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }

    this.events[event].push(callback);

    // Return a function to remove this specific callback
    return () => this.off(event, callback);
  }

  /**
   * Unsubscribe from an event
   * @param {string} event - The event name
   * @param {Function} callback - The callback function to remove
   */
  off(event, callback) {
    if (!this.events[event]) return;

    this.events[event] = this.events[event].filter((cb) => cb !== callback);

    // Clean up empty event arrays
    if (this.events[event].length === 0) {
      delete this.events[event];
    }
  }

  /**
   * Emit an event with data
   * @param {string} event - The event name
   * @param {...any} args - Data to pass to event handlers
   */
  emit(event, ...args) {
    if (!this.events[event]) return;

    this.events[event].forEach((callback) => {
      callback(...args);
    });
  }

  /**
   * Subscribe to an event only once
   * @param {string} event - The event name
   * @param {Function} callback - The callback function
   */
  once(event, callback) {
    const onceWrapper = (...args) => {
      callback(...args);
      this.off(event, onceWrapper);
    };

    return this.on(event, onceWrapper);
  }
}

export default EventEmitter;
