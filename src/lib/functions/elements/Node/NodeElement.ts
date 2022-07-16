import type p5 from "p5";
import Element, { ElementConfig, ElementState, ElementType } from "../Element";
import type { Control, Position } from "../../types";
import AlgorithmStyles from "../../algorithm/styles";

export type NodeConfig = Position & {
  radius?: number;
  fill?: string;
};

export type NodeState = {
  radius: number;
  fill: string;
  endpoint: boolean;
};

export default class NodeElement extends Element<NodeConfig, NodeState> {
  constructor(config: Partial<NodeConfig & ElementConfig> = {}) {
    super(
      ElementType.NODE,
      {
        z: 1,
        fill: "yellow",
        radius: 0,
        ...config,
      },
      {
        radius: config.radius ?? 0,
        fill: config.fill ?? "#000",
      }
    );
  }

  render(p5: p5, view: Control["view"]): void {
    p5.fill(this.fill);
    p5.stroke("#000");
    p5.strokeWeight(1);

    if (this.selected) {
      p5.fill("red");
    }

    if (this.hovering) {
      p5.stroke("blue");
    }

    let radius = this.radius;

    if (this.hovering) {
      radius *= 1.5;
    }

    if (this.state.endpoint) {
      radius *= 2;
    }

    if (
      this.state.scaleWithZoom ||
      this.hovering ||
      this.selected ||
      this.state.endpoint
    ) {
      if (this.hovering || this.selected || this.state.endpoint) {
        p5.circle(this.x, this.y, (radius * 2.5) / Math.min(1, view.zoom));
      } else {
        p5.circle(this.x, this.y, (radius * 2) / Math.min(1, view.zoom));
      }
    } else {
      p5.circle(this.x, this.y, radius * 2);
    }
  }

  isInside(x: number, y: number) {
    let radius = this.radius;

    if (this.hovering) {
      radius *= 1.5;
    }

    if (this.canvas) {
      return (
        Math.hypot(this.x - x, this.y - y) <=
        (radius * 1.2) / this.canvas.controls.view.zoom
      );
    } else {
      return Math.hypot(this.x - x, this.y - y) <= radius * 1.2;
    }
  }

  isInsideScreen(width: number, height: number, view: Control["view"]) {
    const x = this.x * view.zoom + view.x;
    const y = this.y * view.zoom + view.y;

    const outset = this.radius + 10;

    return (
      x >= -outset &&
      x <= width + outset &&
      y >= -outset &&
      y <= height + outset
    );
  }

  isHidden(zoom: number) {
    return (
      this.fill !== AlgorithmStyles.NODE.ENDPOINT.fill &&
      zoom <= 0.85 &&
      !this.selected &&
      !this.hovering &&
      !this.state.endpoint
    );
  }

  get radius() {
    return this.state.radius;
  }

  get fill() {
    return this.state.fill;
  }
}
