import EventEmitter from "./EventEmitter.js";

/**
 * Class to load all the assets i need
 */
class Loader extends EventEmitter {
  constructor(element) {
    if (!(element instanceof HTMLElement)) {
      throw new Error("Loader requires a valid HTMLElement.");
    }

    super();

    /** @private */
    /** @type {HTMLElement} */
    this.element = element;

    /** @private */
    /** @type {HTMLElement} */
    this.bar = document.getElementById("bar");

    /** @private */
    /** @type {HTMLElement} */
    this.percent = document.getElementById("percent");

    /** @private */
    /** @type {string} */
    this.progressBar = "";

    this.start();
  }

  async start() {
    const pixels = ".:x/0";
    let progress = 0;

    while (progress < 100) {
      const bars = "0".repeat(Math.floor(progress / 10));
      const tail = pixels.at(Math.floor((progress % 10) / 2)) || "";
      this.progressBar = bars + tail;
      this.bar.innerText = this.progressBar;
      this.percent.innerText = progress.toString() + "%";

      progress += 1;

      // Wait 50ms before continuing
      await this.delay(50);
    }

    this.percent.innerText = progress.toString() + "%";

    this.emit("loaded", {});
  }

  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export default Loader;
