import { v4 as uuidv4 } from "uuid";
import type { Sketch } from "p5-svelte";
import type p5 from "p5";
import type { Control } from "../types";
import type { AlgorithmActionType } from "../algorithm/Algorithm";

export type ElementConfig = {
  id?: string;
  x: number;
  y: number;
  z: number;
  draggable: boolean;
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
      ...state,
    } as Required<State & ElementState>;
  }

  abstract render(p5: p5): void;
  abstract isInside(x: number, y: number): boolean;

  onHover(hovering: boolean) {}

  onSelect() {}

  onDeselect() {}

  addStateRenderer(state: string, render: (p5: p5) => void) {
    // @ts-ignore
    this.#state.renderer[state] = render;
  }

  isInsideScreen(width: number, height: number, view: Control["view"]) {
    return true;
  }

  makeChangeStateAction<T extends State & ElementState>(
    type: AlgorithmActionType,
    values: Partial<{
      [key in keyof T]: T[key] | ((...args: any) => T[key]);
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
          // @ts-ignore
          this.#state[key] =
            typeof values[key] === "function"
              ? values[key](...args)
              : values[key];
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

  get p5() {
    return this.#p5;
  }

  get id() {
    return this.#id;
  }

  get config() {
    return this.#config;
  }

  get state() {
    return this.#state;
  }

  get type() {
    return this.#type;
  }
}
