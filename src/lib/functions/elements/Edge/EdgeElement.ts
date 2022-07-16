import type p5 from "p5";
import type { Control, Position } from "../../types";
import Element, { ElementConfig, ElementState, ElementType } from "../Element";
import type NodeElement from "../Node/NodeElement";

export type EdgeConfig = {
  source: NodeElement;
  target: NodeElement;
  stroke?: string;
  strokeWeight?: number;
  showArrowIn?: boolean;
  showArrowOut?: boolean;
};

export type EdgeState = {
  stroke: string;
  strokeWeight: number;
  showArrowIn: boolean;
  showArrowOut: boolean;
};

export default class EdgeElement extends Element<EdgeConfig, EdgeState> {
  constructor(config: EdgeConfig & Partial<ElementConfig>) {
    super(
      ElementType.EDGE,
      {
        x: config.source.x,
        y: config.source.y,
        stroke: "black",
        strokeWeight: 1,
        showArrowIn: false,
        showArrowOut: false,
        scaleWithZoom: false,
        ...config,
      },
      {
        stroke: config.stroke ?? "#000",
        strokeWeight: config.strokeWeight ?? 1,
        showArrowIn: config.showArrowIn ?? false,
        showArrowOut: config.showArrowOut ?? false,
        scaleWithZoom: config.scaleWithZoom ?? false,
      }
    );
  }

  render(p5: p5, view: Control["view"]): void {
    p5.stroke(this.stroke);
    if (this.state.scaleWithZoom) {
      p5.strokeWeight(this.strokeWeight / Math.min(1, view.zoom));
    }

    const x1 = this.source.x;
    const y1 = this.source.y;
    const x2 = this.target.x;
    const y2 = this.target.y;

    if (this.hovering) {
      p5.stroke("blue");
      // p5.textAlign(p5.CENTER);
      // p5.text(
      //   this.source.id.slice(0, 4) +
      //     " " +
      //     this.target.id.slice(0, 4),
      //   (x2 - x1) / 2 + x1,
      //   (y2 - y1) / 2 + y1
      // );
    }

    if (this.selected) {
      p5.stroke("red");
    }

    p5.line(x1, y1, x2, y2);

    if (view.zoom > 0.55) {
      if (this.showArrowIn) {
        this.drawArrow(p5, this.target, this.source, 2 / view.zoom);
      }

      if (this.showArrowOut) {
        this.drawArrow(p5, this.source, this.target, 2 / view.zoom);
      }
    }

    p5.strokeWeight(1);
  }

  drawArrow(p5: p5, from: NodeElement, to: NodeElement, arrowSize: number = 2) {
    const dir = p5.createVector(from.x - to.x, from.y - to.y).normalize();
    const tX = from.x - dir.x * arrowSize - dir.x * from.radius * 1.5;
    const tY = from.y - dir.y * arrowSize - dir.y * from.radius * 1.5;

    p5.push();
    p5.translate(tX, tY);
    p5.rotate(dir.heading());
    p5.triangle(0, arrowSize / 2, 0, -arrowSize / 2, arrowSize, 0);
    p5.pop();
  }

  isInside(x0: number, y0: number) {
    const x1 = this.source.x;
    const y1 = this.source.y;
    const x2 = this.target.x;
    const y2 = this.target.y;

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
    // const x1 = this.source.x * view.zoom + view.x;
    // const y1 = this.source.y * view.zoom + view.y;
    // const x2 = this.target.x * view.zoom + view.x;
    // const y2 = this.target.y * view.zoom + view.y;

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
      this.source.isInsideScreen(width, height, view) ||
      this.target.isInsideScreen(width, height, view)
    );
  }

  get stroke() {
    return this.state.stroke;
  }

  get strokeWeight() {
    return this.state.strokeWeight;
  }

  get showArrowIn() {
    return this.state.showArrowIn;
  }

  get showArrowOut() {
    return this.state.showArrowOut;
  }

  get source() {
    return this.config.source;
  }

  get target() {
    return this.config.target;
  }
}
