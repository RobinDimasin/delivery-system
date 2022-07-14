import type EdgeElement from "../elements/Edge/EdgeElement";
import type NodeElement from "../elements/Node/NodeElement";

export enum AlgorithmType {
  DFS = "dfs",
  DIJKSTRA = "dijkstra",
  ASTAR = "A*",
}

export type GraphRawInput = {
  nodes: NodeElement[];
  edges: EdgeElement[];
};

export type GraphInput = Map<
  NodeElement,
  { to: NodeElement; element: EdgeElement }[]
>;

export enum AlgorithmActionType {
  HIGHLIGHT_ENDPOINTS = "HIGHLIGHT_ENDPOINTS",
  PROCESS_NODE = "PROCESS_NODE",
  BUILD_PATH_NODE = "BUILD_PATH_NODE",
  BUILD_PATH_EDGE = "BUILD_PATH_EDGE",
  ENQUEUE_NODE = "ENQUEUE_NODE",
  RESET_STATES = "RESET_STATES",
  BUILD_FINAL_PATH = "BUILD_FINAL_PATH",
  START_PROCESSING_NODE = "START_PROCESSING_NODE",
  PROCESSED_NODE = "PROCESSED_NODE",
}

export type AlgorithmAction = {
  type: AlgorithmActionType;
  perform: (...args: any) => void;
  undo: () => void;
  skip?: boolean;
};

export default abstract class Algorithm {
  #type: AlgorithmType;

  constructor(type: AlgorithmType) {
    this.#type = type;
  }

  start(locations: NodeElement[], graph: GraphRawInput) {
    if (locations.length < 2) {
      throw new Error("Not enough locations, must be at least 2");
    }

    const _graph: GraphInput = new Map();

    for (const node of graph.nodes) {
      const edges = graph.edges
        .filter(
          (edge) =>
            edge.config.source.id === node.id ||
            edge.config.target.id === node.id
        )
        .map((edge) => {
          return {
            to:
              edge.config.source === node
                ? edge.config.target
                : edge.config.source,
            element: edge,
          };
        });

      _graph.set(node, edges);
    }

    const actions = new Array<AlgorithmAction>();
    const buildPathActions = new Array<AlgorithmAction>();

    let pathCount = 0;

    for (let i = 0; i < locations.length - 1; i++) {
      const subActions = this.process(locations[i], locations[i + 1], _graph);
      actions.push(...subActions);
      actions.push({
        type: AlgorithmActionType.RESET_STATES,
        perform: () => {
          [...subActions].reverse().forEach((action) => action.undo());
        },
        undo: () => {
          [...subActions].reverse().forEach((action) => action.perform());
        },
      });

      const buildPathSubActions = subActions.filter(
        ({ type }) => type === "BUILD_PATH_NODE" || type === "BUILD_PATH_EDGE"
      );

      for (const buildPathAction of buildPathSubActions.reverse()) {
        const cnt = pathCount++;
        buildPathActions.push({
          ...buildPathAction,
          type: AlgorithmActionType.BUILD_FINAL_PATH,
          perform: () => {
            buildPathAction.perform((cnt / pathCount) * 100 * 0.5);
          },
        });
      }
    }

    actions.push(...buildPathActions);

    return actions;
  }

  abstract process(
    start: NodeElement,
    end: NodeElement,
    graph: GraphInput
  ): Array<AlgorithmAction>;
}
