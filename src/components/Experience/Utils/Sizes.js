import EventEmitter from "./EventEmitter";

export default class Sizes extends EventEmitter {
  constructor() {
    super();
    // Set initial values
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.pixelRatio = 1;

    // Resize Event
    window.addEventListener("resize", () => {
      // Update sizes
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.pixelRatio = 1;

      this.trigger("resize");
    });
  }
}
