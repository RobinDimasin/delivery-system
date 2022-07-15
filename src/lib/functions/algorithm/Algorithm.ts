import type EdgeElement from "../elements/Edge/EdgeElement";
import NodeElement from "../elements/Node/NodeElement";
import { increaseBrightness } from "../utility";
import AlgorithmStyles from "./styles";

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
  NODE_PROCESSED = "PROCESS_NODE",
  BUILD_PATH_NODE = "BUILD_PATH_NODE",
  BUILD_PATH_EDGE = "BUILD_PATH_EDGE",
  ENQUEUE_NODE = "ENQUEUE_NODE",
  RESET_STATES = "RESET_STATES",
  BUILD_FINAL_PATH = "BUILD_FINAL_PATH",
  START_PROCESSING_NODE = "START_PROCESSING_NODE",
  PROCESSED_NODE = "PROCESSED_NODE",
  SHOW_CURRENT_PATH = "SHOW_CURRENT_PATH",
  SHOW_EDGE_DIRECTION = "SHOW_EDGE_DIRECTION",
}

export type AlgorithmAction = {
  type: AlgorithmActionType;
  perform: (...args: any) => void;
  undo: () => void;
  skip?: boolean;
};

export default abstract class Algorithm {
  #type: AlgorithmType;

  // Functions to call when playing the visualization; change color, size, etc...
  actions = new Array<AlgorithmAction>();

  // Mapping of nodes to their parent
  parentMap = new Map<NodeElement, NodeElement>();

  graph: GraphInput;

  constructor(type: AlgorithmType, graph: GraphRawInput) {
    this.#type = type;

    this.graph = new Map();

    for (const node of graph.nodes) {
      const edges = graph.edges
        .filter(
          (edge) => edge.source.id === node.id || edge.target.id === node.id
        )
        .map((edge) => {
          return {
            to: edge.source === node ? edge.target : edge.source,
            element: edge,
          };
        });

      this.graph.set(node, edges);
    }
  }

  start(locations: NodeElement[]) {
    if (locations.length < 2) {
      throw new Error("Not enough locations, must be at least 2");
    }

    const actions = new Array<AlgorithmAction>();
    const buildPathActions = new Array<AlgorithmAction>();

    let pathCount = 0;

    locations = locations.filter((location) => location);

    for (let i = 0; i < locations.length - 1; i++) {
      const subActions = this.process(locations[i], locations[i + 1]);
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
        ({ type }) =>
          type === AlgorithmActionType.BUILD_PATH_NODE ||
          type === AlgorithmActionType.BUILD_PATH_EDGE ||
          type === AlgorithmActionType.SHOW_EDGE_DIRECTION
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
    end: NodeElement
  ): Array<AlgorithmAction>;

  makeAction(
    actionType: AlgorithmActionType,
    element: NodeElement | EdgeElement
  ) {
    if (element instanceof NodeElement) {
      // if (actionType == AlgorithmActionType.HIGHLIGHT_ENDPOINTS) {
      //   return this.#actionHighlightEndpoint(element);
      // }

      // console.log(actionType == AlgorithmActionType.HIGHLIGHT_ENDPOINTS);

      switch (actionType) {
        case AlgorithmActionType.HIGHLIGHT_ENDPOINTS:
          return this.#actionHighlightEndpoint(element);
        case AlgorithmActionType.NODE_PROCESSED:
          return this.#actionNodeProcessed(element);
        case AlgorithmActionType.BUILD_PATH_NODE:
          return this.#actionBuildPathNode(element);
        case AlgorithmActionType.ENQUEUE_NODE:
          return this.#actionEnqueueNode(element);
        case AlgorithmActionType.START_PROCESSING_NODE:
          return this.#actionNodeProcessing(element);
        default:
          throw new Error(`Not Implemented: ${actionType}`);
      }
    } else {
      switch (actionType) {
        case AlgorithmActionType.BUILD_PATH_EDGE:
          return this.#actionBuildPathEdge(element);
        default:
          throw new Error(`Not Implemented: ${actionType}`);
      }
    }
  }

  #previousPathEdge = new Set<EdgeElement>();
  #previousPathNode = new Set<NodeElement>();

  buildPath(start: NodeElement, end: NodeElement, ignoreCache: boolean = true) {
    let child = end;
    const actions = new Array<AlgorithmAction>();
    const visited = new Set<NodeElement>();

    const pathEdge = new Set<EdgeElement>();
    const pathNode = new Set<NodeElement>();

    while (
      this.parentMap.has(child) &&
      !visited.has(child) &&
      child !== start
    ) {
      pathNode.add(child);

      if (child !== end) {
        actions.push(
          this.makeAction(AlgorithmActionType.BUILD_PATH_NODE, child)
        );
      }

      const parent = this.parentMap.get(child);
      visited.add(child);

      if (parent) {
        const edge = this.graph
          .get(child)
          .find(
            (edge) =>
              edge.element.source === parent || edge.element.target === parent
          );

        if (edge) {
          pathEdge.add(edge.element);
          if (!this.#previousPathEdge.has(edge.element) || ignoreCache) {
            if (edge.element.source === child) {
              actions.push(
                edge.element.makeChangeStateAction(
                  AlgorithmActionType.SHOW_EDGE_DIRECTION,
                  {
                    showArrowOut: true,
                  }
                )
              );
            } else {
              actions.push(
                edge.element.makeChangeStateAction(
                  AlgorithmActionType.SHOW_EDGE_DIRECTION,
                  {
                    showArrowIn: true,
                  }
                )
              );
            }

            actions.push(
              this.makeAction(AlgorithmActionType.BUILD_PATH_EDGE, edge.element)
            );
          }
        }
      }

      child = parent;
    }

    if (!ignoreCache) {
      for (const node of this.#previousPathNode) {
        if (!pathNode.has(node)) {
          actions.push(
            node.makeChangeStateAction(
              AlgorithmActionType.PROCESSED_NODE,
              AlgorithmStyles.NODE.PROCESSED
            )
          );
        }
      }
    }

    if (!ignoreCache) {
      for (const edge of this.#previousPathEdge) {
        if (!pathEdge.has(edge)) {
          actions.push(
            edge.makeChangeStateAction(
              AlgorithmActionType.SHOW_EDGE_DIRECTION,
              AlgorithmStyles.EDGE.DEFAULT
            )
          );
        }
      }
    }

    this.#previousPathEdge = pathEdge;
    this.#previousPathNode = pathNode;

    return actions;
  }

  showCurrentPath(start: NodeElement, currentEnd: NodeElement) {
    const actions = this.buildPath(start, currentEnd, false);

    return {
      type: AlgorithmActionType.SHOW_CURRENT_PATH,
      perform: () => {
        actions.forEach((action) => action.perform());
      },
      undo: () => {
        actions.forEach((action) => action.undo());
      },
    };
  }

  #actionHighlightEndpoint(endpoint: NodeElement) {
    const action = endpoint.makeChangeStateAction(
      AlgorithmActionType.HIGHLIGHT_ENDPOINTS,
      AlgorithmStyles.NODE.ENDPOINT
    );

    this.actions.push(action);

    return action;
  }

  #actionNodeProcessed(node: NodeElement) {
    const action = node.makeChangeStateAction(
      AlgorithmActionType.START_PROCESSING_NODE,
      AlgorithmStyles.NODE.PROCESSED
    );
    this.actions.push(action);

    return action;
  }

  #actionNodeProcessing(node: NodeElement) {
    const action = node.makeChangeStateAction(
      AlgorithmActionType.START_PROCESSING_NODE,
      AlgorithmStyles.NODE.PROCESSING
    );
    this.actions.push(action);

    return action;
  }

  #actionBuildPathNode(node: NodeElement) {
    const action = node.makeChangeStateAction(
      AlgorithmActionType.BUILD_PATH_NODE,
      AlgorithmStyles.NODE.FINAL_PATH
    );

    this.actions.push(action);

    return action;
  }

  #actionBuildPathEdge(edge: EdgeElement) {
    const action = edge.makeChangeStateAction(
      AlgorithmActionType.BUILD_PATH_EDGE,
      AlgorithmStyles.EDGE.FINAL_PATH
    );

    this.actions.push(action);

    return action;
  }

  #actionEnqueueNode(node: NodeElement) {
    const action = node.makeChangeStateAction(
      AlgorithmActionType.ENQUEUE_NODE,
      AlgorithmStyles.NODE.QUEUED
    );

    this.actions.push(action);

    return action;
  }
}
