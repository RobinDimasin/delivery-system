import type p5 from "p5";
import Element, { ElementConfig, ElementType } from "../Element";
import type { Control, Position } from "../../types";

export type NodeConfig = Position & {
  radius?: number;
  fill?: string;
};

export type NodeState = {
  radius: number;
  fill: string;
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

  render(p5: p5): void {
    p5.fill(this.state.fill);
    p5.stroke("#000");

    if (this.state.selected) {
      p5.fill("red");
    }

    if (this.state.hovering) {
      p5.stroke("blue");
      // p5.text(this.config.id.slice(0, 4), this.state.x, this.state.y);
    }

    p5.circle(this.state.x, this.state.y, this.state.radius * 2);
  }

  isInside(x: number, y: number) {
    return (
      Math.hypot(this.state.x - x, this.state.y - y) <= this.state.radius * 1.2
    );
  }

  isInsideScreen(width: number, height: number, view: Control["view"]) {
    const x = this.state.x * view.zoom + view.x;
    const y = this.state.y * view.zoom + view.y;

    const outset = this.state.radius + 10;

    return (
      x >= -outset &&
      x <= width + outset &&
      y >= -outset &&
      y <= height + outset
    );
  }
}
