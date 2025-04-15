import Cursor from "./classes/Cursor.js";
import Focusable from "./classes/Focusable.js";
import InputManager from "./classes/InputManager.js";

document.addEventListener("DOMContentLoaded", () => {
  const cursorElement = document.getElementById("cursor");
  const cursor = new Cursor(cursorElement);

  const focusables = document.querySelectorAll(".focusable");
  const focusableInstances = [];
  focusables.forEach((focusable) => {
    const instance = new Focusable(focusable);
    focusableInstances.push(instance);
  });

  const inputManager = new InputManager(cursor, focusableInstances);

  const animate = () => {
    cursor.update();
    requestAnimationFrame(animate);
  };

  animate();
});
