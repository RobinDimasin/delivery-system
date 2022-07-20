import type p5 from "p5";
import type { Sketch } from "p5-svelte";
import EdgeElement from "./elements/Edge/EdgeElement";
import type Element from "./elements/Element";
import NodeElement from "./elements/Node/NodeElement";
import PolygonElement from "./elements/Polygon/PolygonElement";
import EventEmitter from "./EventEmitter";
import type { Control, Position } from "./types";

export type CanvasConfig = {
  width: number;
  height: number;
  setup: (_p5: p5) => void;
  draw: (_p5: p5) => void;
  editable: boolean;
};

export class Canvas extends EventEmitter {
  #config: CanvasConfig;
  #elements = new Map<string, Element>();
  #elementList: Array<Element> = [];
  #selectedElement: Element | null;
  #previousSelectedElement: Element | null;
  #dragStartPosition: Position = { x: 0, y: 0 };
  #controls: Control = {
    view: { x: 700, y: 75, zoom: 0.2 },
    viewPos: { prevX: null, prevY: null, isDragging: false },
  };
  #pressedButton: number | null;

  constructor(config: Partial<CanvasConfig> = {}) {
    super();

    this.#config = {
      width: 600,
      height: 600,
      editable: false,
      setup: (p5: p5) => {
        this.config.width = p5.windowWidth;
        this.config.height = p5.windowHeight;
        const canvas = p5.createCanvas(this.config.width, this.config.height);
        // canvas.position(0, 0);
      },
      draw: (p5: p5) => {
        p5.background(255);
      },
      ...config,
    };
  }

  setup = (p5: p5) => {
    let img;
    p5.setup = () => {
      this.config.setup(p5);
      img = p5.loadImage("image/manila.png");
      p5.disableFriendlyErrors = true;
    };
    p5.draw = () => {
      p5.translate(this.#controls.view.x, this.#controls.view.y);
      p5.scale(this.#controls.view.zoom);
      this.config.draw(p5);
      p5.image(img, 0, 0);

      this.#elementList.forEach((element) => {
        if (
          (element.state.hidden ||
            element.isHidden(this.#controls.view.zoom)) &&
          !element.state.alwaysShow &&
          !element.state.hovering
        ) {
          return;
        }

        if (
          !element.isInsideScreen(
            this.config.width,
            this.config.height,
            this.#controls.view
          )
        ) {
          return;
        }

        element.state.selected = this.#selectedElement === element;

        // const renderer = element.state.renderer[element.state.render];

        // p5.push();
        // if (renderer) {
        //   renderer(p5);
        // } else {
        element.render(p5, this.#controls.view);
        // }
        // p5.pop();
      });
    };

    p5.frameRate(30);

    p5.windowResized = () => {
      this.config.width = p5.windowWidth;
      this.config.height = p5.windowHeight;
      p5.resizeCanvas(this.config.width, this.config.height);
    };

    p5.mouseMoved = (event: MouseEvent) => {
      if (!(event.target instanceof HTMLCanvasElement)) {
        return;
      }

      this.hoverElement(p5.mouseX, p5.mouseY);
    };

    p5.mouseDragged = (event: MouseEvent) => {
      if (!(event.target instanceof HTMLCanvasElement)) {
        return;
      }

      if (this.config.editable) {
        this.dragElement(p5.mouseX, p5.mouseY);
      }

      if (this.#pressedButton === 1) {
        this.dragScreen(event.clientX, event.clientY);
        event.preventDefault();
      }
    };

    p5.mousePressed = (event: MouseEvent) => {
      if (!(event.target instanceof HTMLCanvasElement)) {
        return;
      }

      if (
        event.screenX <= this.config.width &&
        event.screenY <= this.config.height
      ) {
        this.#pressedButton = event.button;
        if (this.#pressedButton === 1) {
          this.startDragging(event.clientX, event.clientY);
        }
        this.handleMousePress(p5.mouseX, p5.mouseY, event.button);
      }
    };

    p5.mouseReleased = (event: MouseEvent) => {
      if (!(event.target instanceof HTMLCanvasElement)) {
        return;
      }
      this.handleMouseReleased();

      this.stopDragging(event.clientX, event.clientY);
      this.#pressedButton = null;
    };

    p5.mouseWheel = (event: WheelEvent) => {
      if (!(event.target instanceof HTMLCanvasElement)) {
        return;
      }
      const { x, y, deltaY } = event;
      this.zoom(x, y, deltaY);
    };
  };

  hoverElement(x: number, y: number) {
    const hoveringElement = [...this.#elementList]
      .reverse()
      .find((element) =>
        element.isInside(
          (x - this.#controls.view.x) / this.#controls.view.zoom,
          (y - this.#controls.view.y) / this.#controls.view.zoom
        )
      );

    this.#elementList.forEach((element) => {
      element.state.hovering = element === hoveringElement;
    });

    if (hoveringElement) {
      this.emit("hoverElement", hoveringElement);
    }
  }

  handleMousePress(x: number, y: number, button: number) {
    const realX = (x - this.#controls.view.x) / this.#controls.view.zoom;
    const realY = (y - this.#controls.view.y) / this.#controls.view.zoom;
    const pressedElement = [...this.#elementList]
      .reverse()
      .find((element) => element.isInside(realX, realY));
    this.handleElementClick(pressedElement);
    if (!pressedElement && this.#pressedButton === 0) {
      this.emit("canvasClick", {
        x: realX,
        y: realY,
        previousSelectedElement: this.#previousSelectedElement,
      });
    }
  }

  handleMouseReleased() {
    if (
      this.#previousSelectedElement === this.#selectedElement &&
      this.#selectedElement
    ) {
      this.emit("deselectElement", { element: this.#selectedElement });
      this.#selectedElement.state.selected = false;
      this.#selectedElement = null;
    }
  }

  handleCanvasClick(x: number, y: number) {
    this.emit("canvasClick", {
      x,
      y,
    });
  }

  handleElementClick(element: Element) {
    this.selectElement(element);
  }

  selectElement(element: Element) {
    this.#previousSelectedElement = this.#selectedElement;

    if (this.#selectedElement) {
      this.emit("deselectElement", {
        element: this.#selectedElement,
      });
      const same = this.#selectedElement === element;
      this.#selectedElement.state.selected = false;
      this.#selectedElement = null;

      if (same) {
        return;
      }
    }

    this.#selectedElement = element;

    if (this.#selectedElement) {
      this.#selectedElement.state.selected = true;
      this.emit("selectElement", {
        element: this.#selectedElement,
        previousSelectedElement: this.#previousSelectedElement,
      });
    }
  }

  deselectElement() {
    this.#previousSelectedElement = this.#selectedElement;

    if (this.#selectedElement) {
      this.emit("deselectElement", {
        element: this.#selectedElement,
      });
      this.#selectedElement.state.selected = false;
    }

    this.#selectedElement = null;
  }

  dragElement(x: number, y: number) {
    if (this.#selectedElement && this.#selectedElement.state.draggable) {
      const newX = (x - this.#controls.view.x) / this.#controls.view.zoom;
      const newY = (y - this.#controls.view.y) / this.#controls.view.zoom;

      this.emit("deselectElement", {
        element: this.#selectedElement,
      });

      this.#selectedElement.state.x = newX;
      this.#selectedElement.state.y = newY;
    }
  }

  dragScreen(x: number, y: number) {
    const { prevX, prevY, isDragging } = this.#controls.viewPos;
    if (!isDragging || this.#selectedElement) return;

    const dx = x - prevX;
    const dy = y - prevY;

    this.emit("dragScreen", {
      from: {
        x: prevX,
        y: prevY,
      },
      to: {
        x,
        y,
      },
    });

    if (prevX || prevY) {
      this.#controls.view.x += dx;
      this.#controls.view.y += dy;
      this.#controls.viewPos.prevX = x;
      this.#controls.viewPos.prevY = y;
    }
  }

  startDragging(x: number, y: number) {
    this.emit("startDragging", { x, y });
    this.#controls.viewPos.isDragging = true;
    this.#controls.viewPos.prevX = x;
    this.#controls.viewPos.prevY = y;
  }

  stopDragging(x: number, y: number) {
    this.emit("stopDragging", {
      from: {
        x: this.#controls.viewPos.prevX,
        y: this.#controls.viewPos.prevY,
      },
      to: { x, y },
    });

    this.#controls.viewPos.isDragging = false;
    this.#controls.viewPos.prevX = null;
    this.#controls.viewPos.prevY = null;
  }

  zoom(x: number, y: number, deltaY: number) {
    const direction = deltaY > 0 ? -1 : 1;
    const factor = 0.15;
    const zoom = 1 * direction * factor;

    const wx =
      (x - this.#controls.view.x) /
      (this.#config.width * this.#controls.view.zoom);
    const wy =
      (y - this.#controls.view.y) /
      (this.#config.height * this.#controls.view.zoom);

    if (this.#controls.view.zoom + zoom < 0.05) {
      return;
    }

    this.emit("zoom", { zoom });

    this.#controls.view.x -= wx * this.#config.width * zoom;
    this.#controls.view.y -= wy * this.#config.height * zoom;
    this.#controls.view.zoom += zoom;
  }

  newElement<T extends Element>(
    element: new (...args: any[]) => T,
    ...args: ConstructorParameters<new (...args: any[]) => T>
  ) {
    const el = new element(...args);

    this.addElement(el);

    return el;
  }

  addElement(...elements: Element[]) {
    elements.forEach((el) => {
      this.elements.set(el.id, el);
      el.canvas = this;
    });

    this.#elementList = Array.from(this.elements.values()).sort(
      (a, b) => a.state.z - b.state.z
    );
  }

  deleteElement(...elements: Element[]) {
    for (const element of elements) {
      if (this.#selectedElement === element && element) {
        this.#selectedElement.state.selected = false;
        this.#selectedElement = null;
      }

      this.elements.delete(element.id);
      element.onDelete();
      this.#elementList = Array.from(this.elements.values()).sort(
        (a, b) => a.state.z - b.state.z
      );
    }
  }

  setConfig<T extends keyof CanvasConfig>(config: T, value: CanvasConfig[T]) {
    this.config[config] = value;
  }

  get elements() {
    return this.#elements;
  }

  get config() {
    return this.#config;
  }

  get selectedElement() {
    return this.#selectedElement;
  }

  set selectedElement(element: Element) {
    if (this.#previousSelectedElement) {
      this.#previousSelectedElement.state.selected = false;
    }

    this.#previousSelectedElement = this.#selectedElement;
    this.#selectedElement = element;

    if (this.#selectedElement) {
      this.#selectedElement.state.selected = true;
    }
  }

  get controls() {
    return this.#controls;
  }
}

export declare interface Canvas {
  on(event: "hoverElement", listener: (element: Element) => void): () => void;
  on(
    event: "deselectElement",
    listener: (arg: { element: Element }) => void
  ): () => void;
  on(
    event: "selectElement",
    listener: (arg: {
      element: Element;
      previousSelectedElement: Element;
    }) => void
  ): () => void;
  on(
    event: "dragScreen",
    listener: (arg: { from: Position; to: Position }) => void
  ): () => void;
  on(
    event: "canvasClick",
    listener: (arg: Position & { previousSelectedElement: Element }) => void
  ): () => void;
  on(event: "startDragging", listener: (start: Position) => void): () => void;
  on(
    event: "stopDragging",
    listener: (arg: { from: Position; to: Position }) => void
  ): () => void;
  on(event: "zoom", listener: (arg: { zoom: number }) => void): () => void;
}
