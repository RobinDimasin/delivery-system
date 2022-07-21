import type p5 from "p5";
import type { Control, Position } from "../../types";
import {
  colorAlpha,
  getCenterOfPolygon,
  isPointInsidePolygon,
  randomColor,
} from "../../utility";
import type EdgeElement from "../Edge/EdgeElement";
import Element, { ElementConfig, ElementState, ElementType } from "../Element";
import NodeElement from "../Node/NodeElement";

export type PolygonConfig = {
  points?: NodeElement[];
  fill?: string;
  stroke?: string;
  strokeWeight?: number;
};

export type PolygonState = {
  points: Position[];
  fill: string;
  stroke: string;
  strokeWeight: number;
};

export default class PolygonElement extends Element<
  PolygonConfig,
  PolygonState
> {
  #edges = new Array<EdgeElement>();
  #nodes = new Array<NodeElement>();

  constructor(config: PolygonConfig & Partial<ElementConfig>) {
    super(
      ElementType.EDGE,
      {
        points: [],
        fill: "white",
        stroke: "black",
        strokeWeight: 1,
        z: -1,
        ...config,
      },
      {
        points: [],
        fill: config.fill ?? randomColor(),
        stroke: config.stroke ?? "#000",
        strokeWeight: config.strokeWeight ?? 1,
      }
    );

    for (const point of config.points ?? []) {
      this.addPoint(point.x, point.y);
    }
  }

  render(p5: p5, view: Control["view"]): void {
    p5.stroke(this.stroke);
    if (this.state.scaleWithZoom) {
      p5.strokeWeight(this.strokeWeight / Math.min(1, view.zoom));
    }

    // for (const edge of this.edges) {
    //   edge.render(p5, view);
    // }

    // for (const node of this.nodes) {
    //   node.render(p5, view);
    // }

    p5.fill(colorAlpha(this.fill, 0.05));

    // if (this.hovering) {
    //   p5.fill("yellow");
    // }

    p5.strokeWeight(0);

    for (let i = 0; i < this.points.length; i++) {
      const point = this.points[i];
      if (i === 0) {
        p5.beginShape();
      }

      p5.vertex(point.x, point.y);

      if (i === this.points.length - 1) {
        p5.endShape(p5.CLOSE);
      }
    }

    const mid = getCenterOfPolygon(
      this.points.map((point) => ({ x: point.x, y: point.y }))
    );

    p5.stroke("black");
    p5.fill("black");
    p5.textSize(10 / view.zoom);
    p5.textAlign(p5.CENTER);
    p5.text(this.state.label, mid.x, mid.y);
    p5.strokeWeight(1);
  }

  addPoint(x: number, y: number) {
    const node = new NodeElement({
      x,
      y,
      radius: 2,
      z: 1,
      fill: "purple",
      draggable: true,
    });

    this.points.push(node);
    this.nodes.push(node);

    // if (this.canvas) {
    //   this.canvas.addElement(node);
    // }

    // const len = this.nodes.length;
    // if (len >= 2) {
    //   const edge = new EdgeElement({
    //     source: this.nodes[len - 2],
    //     target: this.nodes[len - 1],
    //   });
    //   this.edges.push(edge);

    //   if (this.canvas) {
    //     this.canvas.addElement(edge);
    //   }
    // }
  }

  removePoint() {
    this.points.pop();
    this.edges.pop();
  }

  isInside(x: number, y: number) {
    return (
      !this.state.hidden &&
      isPointInsidePolygon(
        { x, y },
        this.points.map((point) => ({ x: point.x, y: point.y }))
      )
    );
  }

  isInsideScreen(width: number, height: number, view: Control["view"]) {
    return this.nodes.some((point) =>
      point.isInsideScreen(width, height, view)
    );
  }

  onDelete() {
    if (this.canvas) {
      this.canvas.deleteElement(...this.edges, ...this.nodes);
    }
  }

  set hidden(b: boolean) {
    this.state.hidden = b;
    this.nodes.forEach((node) => (node.state.hidden = b));
    this.edges.forEach((edge) => (edge.state.hidden = b));
  }

  get stroke() {
    return this.state.stroke;
  }

  get strokeWeight() {
    return this.state.strokeWeight;
  }

  get fill() {
    return this.state.fill;
  }

  get points() {
    return this.state.points;
  }

  get edges() {
    return this.#edges;
  }

  get nodes() {
    return this.#nodes;
  }
}
