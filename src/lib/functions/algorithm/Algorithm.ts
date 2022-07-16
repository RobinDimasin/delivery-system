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
  PROCESSED_EDGE = "PROCESSED_EDGE",
  SHOW_CURRENT_PATH = "SHOW_CURRENT_PATH",
  SHOW_EDGE_DIRECTION = "SHOW_EDGE_DIRECTION",
  NODE_DEFAULT = "NODE_DEFAULT",
  EDGE_DEFAULT = "EDGE_DEFAULT",
  NODE_STATELESS = "NODE_STATELESS",
  EDGE_STATELESS = "EDGE_STATELESS",
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

  *startGenerator(locations: NodeElement[]) {
    if (locations.length < 2) {
      throw new Error("Not enough locations, must be at least 2");
    }

    locations = locations.filter((location) => location);

    const path = new Array<NodeElement>();

    this.resetGraphVisual();

    for (let i = 0; i < locations.length - 1; i++) {
      this.parentMap.clear();
      const gen = this.processGenerator(locations[i], locations[i + 1]);

      while (!gen.next().done) {
        yield;
      }

      const subPath = new Array<NodeElement>();

      if (this.parentMap.has(locations[i + 1])) {
        let child = locations[i + 1];
        subPath.push(child);

        while (this.parentMap.has(child)) {
          const parent = this.parentMap.get(child);
          subPath.push(parent);
          child = parent;
        }
      }

      path.push(...subPath.reverse());

      this.resetGraphVisual();
      this.#previousPathEdge.clear();
      this.#previousPathNode.clear();
      yield;
    }

    for (let i = 0; i < path.length - 1; i++) {
      const from = path[i];
      const to = path[i + 1];

      this.makeAction(AlgorithmActionType.BUILD_PATH_NODE, from).perform(
        (i / path.length) * 100 * 0.5
      );
      this.makeAction(AlgorithmActionType.BUILD_PATH_NODE, to).perform(
        (i / path.length) * 100 * 0.5
      );

      const edge = this.graph
        .get(from)
        .find(
          (edge) => edge.element.source === to || edge.element.target === to
        );

      if (edge) {
        if (edge.element.source === from) {
          edge.element
            .makeChangeStateAction(AlgorithmActionType.SHOW_EDGE_DIRECTION, {
              showArrowIn: true,
            })
            .perform();
        } else {
          edge.element
            .makeChangeStateAction(AlgorithmActionType.SHOW_EDGE_DIRECTION, {
              showArrowOut: true,
            })
            .perform();
        }

        this.makeAction(
          AlgorithmActionType.BUILD_PATH_EDGE,
          edge.element
        ).perform((i / path.length) * 100 * 0.5);
      }

      if (locations.includes(from)) {
        this.makeAction(
          AlgorithmActionType.HIGHLIGHT_ENDPOINTS,
          from
        ).perform();
        this.makeAction(AlgorithmActionType.HIGHLIGHT_ENDPOINTS, to).perform();
      }

      if (locations.includes(to)) {
        this.makeAction(AlgorithmActionType.HIGHLIGHT_ENDPOINTS, to).perform();
      }

      yield;
    }
  }

  abstract process(
    start: NodeElement,
    end: NodeElement
  ): Array<AlgorithmAction>;

  abstract processGenerator(
    start: NodeElement,
    end: NodeElement
  ): IterableIterator<any>;

  makeAction(
    actionType: AlgorithmActionType,
    element: NodeElement | EdgeElement,
    save: boolean = false
  ) {
    let action: AlgorithmAction | undefined;
    if (element instanceof NodeElement) {
      // if (actionType == AlgorithmActionType.HIGHLIGHT_ENDPOINTS) {
      //   return this.#actionHighlightEndpoint(element);
      // }

      // console.log(actionType == AlgorithmActionType.HIGHLIGHT_ENDPOINTS);

      switch (actionType) {
        case AlgorithmActionType.HIGHLIGHT_ENDPOINTS:
          action = this.#actionHighlightEndpoint(element);
          break;
        case AlgorithmActionType.NODE_PROCESSED:
          action = this.#actionNodeProcessed(element);
          break;
        case AlgorithmActionType.BUILD_PATH_NODE:
          action = this.#actionBuildPathNode(element);
          break;
        case AlgorithmActionType.ENQUEUE_NODE:
          action = this.#actionEnqueueNode(element);
          break;
        case AlgorithmActionType.START_PROCESSING_NODE:
          action = this.#actionNodeProcessing(element);
          break;
        case AlgorithmActionType.NODE_DEFAULT:
          action = this.#actionNodeDefault(element);
          break;
        case AlgorithmActionType.NODE_STATELESS:
          action = this.#actionNodeStateless(element);
          break;
        default:
          throw new Error(`Not Implemented: ${actionType}`);
      }
    } else {
      switch (actionType) {
        case AlgorithmActionType.BUILD_PATH_EDGE:
          action = this.#actionBuildPathEdge(element);
          break;
        case AlgorithmActionType.PROCESSED_EDGE:
          action = this.#actionEdgeProcessed(element);
          break;
        case AlgorithmActionType.EDGE_DEFAULT:
          action = this.#actionEdgeDefault(element);
          break;
        case AlgorithmActionType.EDGE_STATELESS:
          action = this.#actionEdgeStateless(element);
          break;
        default:
          throw new Error(`Not Implemented: ${actionType}`);
      }
    }

    if (action && save) {
      this.actions.push(action);
    }

    return action;
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
              {
                ...AlgorithmStyles.EDGE.PROCESSED,
                showArrowIn: false,
                showArrowOut: false,
                strokeWeight: 1,
              }
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
    return endpoint.makeChangeStateAction(
      AlgorithmActionType.HIGHLIGHT_ENDPOINTS,
      AlgorithmStyles.NODE.ENDPOINT
    );
  }

  #actionNodeProcessed(node: NodeElement) {
    return node.makeChangeStateAction(
      AlgorithmActionType.PROCESSED_EDGE,
      AlgorithmStyles.NODE.PROCESSED
    );
  }

  #actionNodeProcessing(node: NodeElement) {
    return node.makeChangeStateAction(
      AlgorithmActionType.START_PROCESSING_NODE,
      AlgorithmStyles.NODE.PROCESSING
    );
  }

  #actionBuildPathNode(node: NodeElement) {
    return node.makeChangeStateAction(
      AlgorithmActionType.BUILD_PATH_NODE,
      AlgorithmStyles.NODE.FINAL_PATH
    );
  }

  #actionBuildPathEdge(edge: EdgeElement) {
    return edge.makeChangeStateAction(
      AlgorithmActionType.BUILD_PATH_EDGE,
      AlgorithmStyles.EDGE.FINAL_PATH
    );
  }

  #actionEdgeProcessed(edge: EdgeElement) {
    return edge.makeChangeStateAction(
      AlgorithmActionType.PROCESSED_EDGE,
      AlgorithmStyles.EDGE.PROCESSED
    );
  }

  #actionEnqueueNode(node: NodeElement) {
    return node.makeChangeStateAction(
      AlgorithmActionType.ENQUEUE_NODE,
      AlgorithmStyles.NODE.QUEUED
    );
  }

  #actionNodeDefault(node: NodeElement) {
    return node.makeChangeStateAction(
      AlgorithmActionType.NODE_DEFAULT,
      AlgorithmStyles.NODE.DEFAULT
    );
  }

  #actionEdgeDefault(edge: EdgeElement) {
    return edge.makeChangeStateAction(
      AlgorithmActionType.EDGE_DEFAULT,
      AlgorithmStyles.EDGE.DEFAULT
    );
  }

  #actionNodeStateless(node: NodeElement) {
    return node.makeChangeStateAction(
      AlgorithmActionType.NODE_STATELESS,
      AlgorithmStyles.NODE.STATELESS
    );
  }

  #actionEdgeStateless(edge: EdgeElement) {
    return edge.makeChangeStateAction(
      AlgorithmActionType.EDGE_STATELESS,
      AlgorithmStyles.EDGE.STATELESS
    );
  }

  resetGraphVisual() {
    for (const [node, edges] of this.graph.entries()) {
      this.makeAction(AlgorithmActionType.NODE_STATELESS, node).perform();

      for (const { element: edge } of edges) {
        this.makeAction(AlgorithmActionType.EDGE_STATELESS, edge).perform();
      }
    }
  }
}
