import Cursor from "./classes/Cursor.js";
import Focusable from "./classes/Focusable.js";
import InputManager from "./classes/InputManager.js";
import Loader from "./classes/Loader.js";

document.addEventListener("DOMContentLoaded", () => {
  const cursorElement = document.getElementById("cursor");
  const cursor = new Cursor(cursorElement);

  const focusables = document.querySelectorAll(".focusable");
  const focusableInstances = [];
  focusables.forEach((focusable) => {
    const instance = new Focusable(focusable);
    focusableInstances.push(instance);
  });

  const loaderElement = document.getElementById("loader");
  const loader = new Loader(loaderElement);

  void new InputManager(cursor, focusableInstances);

  window.addEventListener("resize", () => {
    // Update all focusable positions
    focusableInstances.forEach((focusable) => {
      focusable.update();
    });
  });

  const animate = () => {
    cursor.update();
    requestAnimationFrame(animate);
  };

  animate();
});
