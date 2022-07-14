import type p5 from "p5";
import type { Control, Position } from "../../types";
import Element, { ElementConfig, ElementState, ElementType } from "../Element";
import type NodeElement from "../Node/NodeElement";

export type EdgeConfig = {
  source: NodeElement;
  target: NodeElement;
  stroke?: string;
  strokeWeight?: number;
};

export type EdgeState = {
  stroke: string;
  strokeWeight: number;
};

export default class EdgeElement extends Element<EdgeConfig, EdgeState> {
  constructor(config: EdgeConfig & Partial<ElementConfig>) {
    super(
      ElementType.EDGE,
      {
        x: config.source.state.x,
        y: config.source.state.y,
        stroke: "black",
        strokeWeight: 1,
        ...config,
      },
      {
        stroke: config.stroke ?? "#000",
        strokeWeight: config.strokeWeight ?? 1,
      }
    );
  }

  render(p5: p5): void {
    p5.stroke(this.state.stroke);
    p5.strokeWeight(this.state.strokeWeight);

    const x1 = this.config.source.state.x;
    const y1 = this.config.source.state.y;
    const x2 = this.config.target.state.x;
    const y2 = this.config.target.state.y;

    if (this.state.hovering) {
      p5.stroke("blue");
      p5.textAlign(p5.CENTER);
      // p5.text(
      //   this.config.source.id.slice(0, 4) +
      //     " " +
      //     this.config.target.id.slice(0, 4),
      //   (x2 - x1) / 2 + x1,
      //   (y2 - y1) / 2 + y1
      // );
    }

    if (this.state.selected) {
      p5.stroke("red");
    }

    p5.line(x1, y1, x2, y2);
  }

  isInside(x0: number, y0: number) {
    const x1 = this.config.source.state.x;
    const y1 = this.config.source.state.y;
    const x2 = this.config.target.state.x;
    const y2 = this.config.target.state.y;

    const minX = Math.min(x1, x2);
    const minY = Math.min(y1, y2);

    const maxX = Math.max(x1, x2);
    const maxY = Math.max(y1, y2);

    const distance =
      Math.abs((x2 - x1) * (y1 - y0) - (x1 - x0) * (y2 - y1)) /
      Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));

    return (
      distance <= 2 && x0 >= minX && x0 <= maxX && y0 >= minY && y0 <= maxY
    );
  }

  isInsideScreen(width: number, height: number, view: Control["view"]) {
    // const x1 = this.config.source.state.x * view.zoom + view.x;
    // const y1 = this.config.source.state.y * view.zoom + view.y;
    // const x2 = this.config.target.state.x * view.zoom + view.x;
    // const y2 = this.config.target.state.y * view.zoom + view.y;

    // const minX = Math.min(x1, x2);
    // const minY = Math.min(y1, y2);

    // const maxX = Math.max(x1, x2);
    // const maxY = Math.max(y1, y2);

    // const outset = 10;

    // return (
    //   (x1 >= -outset &&
    //     x1 <= width + outset &&
    //     y1 >= -outset &&
    //     y1 <= height + outset) ||
    //   (x2 >= -outset &&
    //     x2 <= width + outset &&
    //     y2 >= -outset &&
    //     y2 <= height + outset)
    // );

    return (
      this.config.source.isInsideScreen(width, height, view) ||
      this.config.target.isInsideScreen(width, height, view)
    );
  }
}
