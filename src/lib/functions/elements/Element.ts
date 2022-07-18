import { v4 as uuidv4 } from "uuid";
import type { Sketch } from "p5-svelte";
import type p5 from "p5";
import type { Control } from "../types";
import type { AlgorithmActionType } from "../algorithm/Algorithm";
import type { Canvas } from "../Canvas";
import { DEFAULT, DefaultType } from "../algorithm/styles";

export type ElementConfig = {
  id?: string;
  x: number;
  y: number;
  z: number;
  draggable: boolean;
  scaleWithZoom?: boolean;
  hide: boolean;
  alwaysShow: boolean;
  label?: string;
};

export type ElementState = {
  x: number;
  y: number;
  z: number;
  draggable: boolean;
  dragging: boolean;
  selected: boolean;
  hovering: boolean;
  render: string;
  renderer: Record<string, (p5: p5) => void>;
  scaleWithZoom: boolean;
  hidden: boolean;
  alwaysShow: boolean;
  label?: string;
};

export enum ElementType {
  NODE = "node",
  EDGE = "edge",
}

export default abstract class Element<
  Config extends Record<string, any> = {},
  State extends Record<string, any> = {}
> {
  #p5: Sketch;
  #id: string = uuidv4();
  #type: ElementType;

  #config: Required<Config & ElementConfig>;
  #state: Required<State & ElementState>;
  #canvas: Canvas | undefined;

  constructor(
    type: ElementType,
    config: Partial<Config & ElementConfig> = {},
    state: Partial<State & ElementState> = {}
  ) {
    this.#type = type;

    this.#config = {
      x: 0,
      y: 0,
      z: 0,
      draggable: false,
      scaleWithZoom: false,
      hide: false,
      alwaysShow: false,
      ...config,
    } as Required<Config & ElementConfig>;

    if (this.config.id) {
      this.#id = this.config.id;
    }

    this.#state = {
      x: this.#config.x ?? 0,
      y: this.#config.y ?? 0,
      z: this.#config.z ?? 0,
      draggable: this.#config.draggable ?? false,
      dragging: false,
      selected: false,
      hovering: false,
      render: "default",
      renderer: {},
      hidden: false,
      scaleWithZoom: this.#config.scaleWithZoom ?? false,
      alwaysShow: false,
      label: this.#config.label ?? undefined,
      ...state,
    } as Required<State & ElementState>;
  }

  abstract render(p5: p5, view: Control["view"]): void;
  abstract isInside(x: number, y: number): boolean;

  onHover(hovering: boolean) {}

  onSelect() {}

  onDeselect() {}

  onDelete() {}

  addStateRenderer(state: string, render: (p5: p5) => void) {
    // @ts-ignore
    this.#state.renderer[state] = render;
  }

  isInsideScreen(width: number, height: number, view: Control["view"]) {
    return true;
  }

  isHidden(zoom: number) {
    return this.hidden;
  }

  makeChangeStateAction<T extends State & ElementState>(
    type: AlgorithmActionType,
    values: Partial<{
      [key in keyof T]:
        | (T[key] | DefaultType)
        | ((...args: any) => T[key] | DefaultType);
    }>
  ) {
    const originalValues: Partial<State & ElementState> = {};

    for (const key of Object.keys(values)) {
      // @ts-ignore
      originalValues[key] = this.#state[key];
    }

    return {
      type,
      perform: (...args: any) => {
        for (const key of Object.keys(values)) {
          const value = values[key];
          // @ts-ignore
          this.#state[key] =
            value === DEFAULT
              ? this.#config[key]
              : typeof value === "function"
              ? value(...args)
              : value;
        }
      },
      undo: () => {
        this.#state = {
          ...this.state,
          ...originalValues,
        };
      },
    };
  }

  get type() {
    return this.#type;
  }

  get config() {
    return this.#config;
  }

  get state() {
    return this.#state;
  }

  get id() {
    return this.#id;
  }

  get x() {
    return this.#state.x;
  }

  get y() {
    return this.#state.y;
  }

  get z() {
    return this.#state.z;
  }

  get draggable() {
    return this.#state.draggable;
  }

  get dragging() {
    return this.#state.dragging;
  }

  get selected() {
    return this.#state.selected;
  }

  get hovering() {
    return this.#state.hovering;
  }

  get renderer() {
    return this.#state.renderer;
  }

  get canvas() {
    return this.#canvas;
  }

  set canvas(canvas: Canvas) {
    this.#canvas = canvas;
  }

  get hidden() {
    return this.state.hidden;
  }

  set hidden(b: boolean) {
    // @ts-ignore
    this.state.hidden = b;
  }
}
