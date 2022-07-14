import type EdgeElement from "../elements/Edge/EdgeElement";
import type NodeElement from "../elements/Node/NodeElement";

export enum AlgorithmType {
  DFS = "dfs",
  DIJKSTRA = "dijkstra",
  ASTAR = "A*",
}

export type GraphInput = {
  nodes: NodeElement[];
  edges: EdgeElement[];
};

export default abstract class Algorithm {
  #type: AlgorithmType;

  constructor(type: AlgorithmType) {
    this.#type = type;
  }

  abstract start(start: NodeElement, end: NodeElement, graph: GraphInput): void;
}
