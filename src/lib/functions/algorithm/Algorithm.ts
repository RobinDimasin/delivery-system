import type EdgeElement from "../elements/Edge/EdgeElement";
import NodeElement from "../elements/Node/NodeElement";
import { shuffle } from "../utility";
import AlgorithmStyles from "./styles";
import { v4 as uuidv4 } from "uuid";

export enum AlgorithmType {
  DFS = "Depth-First search",
  DIJKSTRA = "Dijkstra",
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

type PathSegment = {
  from?: NodeElement;
  to?: NodeElement;
  edge?: EdgeElement;
  weight: number;
};

export type Path = {
  start: NodeElement;
  end: NodeElement;
  visited: Record<string, any>;
  segments: PathSegment[];
  renderer: IterableIterator<void>;
  distance: number;
  resetRenderer: () => IterableIterator<void>;
  render: (resetGraphVisual: boolean) => void;
  resetGraphVisual: () => void;
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

    for (const edge of graph.edges) {
      const { source, target } = edge;
      for (const node of [source, target]) {
        if (!this.graph.has(node)) {
          this.graph.set(node, new Array());
        }
        this.graph.get(node).push({
          to: node === source ? target : source,
          element: edge,
        });
      }
    }

    for (const node of this.graph.keys()) {
      const edges = this.graph.get(node);

      this.graph.set(node, shuffle(edges));
    }
  }

  compute(locations: NodeElement[]) {
    this.emptyActions();

    const startTime = performance.now();

    const paths = new Array<Path>();
    let visited: Record<string, any> = {};

    for (let i = 0; i < locations.length - 1; i++) {
      this.parentMap.clear();
      const start = locations[i];
      const end = locations[i + 1];
      const gen = this.processGenerator(start, end, true);
      let subVisited = {
        ...visited,
      };

      while (true) {
        const { value, done } = gen.next();

        if (value) {
          for (const [key, v] of Object.entries(value)) {
            if (key in visited) {
              subVisited[key] = visited[key] + v;
            } else {
              subVisited[key] = v;
            }
          }
        }
        if (done) {
          break;
        }
      }

      visited = {
        ...visited,
        ...subVisited,
      };

      const segments = new Array<PathSegment>();

      if (this.parentMap.has(locations[i + 1])) {
        let child = locations[i + 1];
        segments.push({
          to: child,
          weight: 0,
        });

        while (this.parentMap.has(child)) {
          const parent = this.parentMap.get(child);

          const edge = this.graph
            .get(parent)
            .find(
              (edge) =>
                edge.element.source === child || edge.element.target === child
            );

          segments.push({
            from: parent,
            to: child,
            edge: edge.element,
            weight: Math.hypot(parent.x - child.x, parent.y - child.y),
          });

          child = parent;
        }
      }

      segments.reverse();

      const newPathRenderer = () => this.pathRenderer(segments, true);

      paths.push({
        start,
        end,
        segments: segments,
        visited: subVisited,
        renderer: newPathRenderer(),
        resetRenderer: function () {
          this.renderer = newPathRenderer();

          return this.renderer;
        },
        distance: segments.reduce(
          (distance, segment) => distance + segment.weight,
          0
        ),
        render: (resetGraphVisual = true) =>
          this.renderPath(segments, resetGraphVisual),
        resetGraphVisual: () => this.resetGraphVisual(),
      });
    }

    const endTime = performance.now();

    const processGenerator = () => this.startGenerator(locations);

    function* newProcessRenderer() {
      const gen = processGenerator();

      while (true) {
        let val,
          done = false;
        for (let i = 0; i < 10; i++) {
          const { value, done: _done } = gen.next();
          if (value) {
            val = value;
          }
          if (_done) {
            done = true;
          }
        }
        yield val;

        if (done) {
          break;
        }
      }
    }

    function* newAllPathsRenderer() {
      for (const path of paths) {
        const renderer = path.resetRenderer();

        while (!renderer.next().done) {
          yield;
        }
      }
    }

    this.resetGraphVisual();

    return {
      id: uuidv4(),
      algorithmUsed: this.#type,
      process: {
        visited,
        renderer: newProcessRenderer(),
        resetRenderer: function () {
          this.renderer = newProcessRenderer();

          return this.renderer;
        },
        render: (resetGraphVisual = true) => {
          this.resetGraphVisual();
          paths.forEach((path) => path.render(false));
        },
        resetGraphVisual: () => this.resetGraphVisual(),
      },
      allPaths: {
        renderer: newAllPathsRenderer(),
        resetRenderer: function () {
          this.renderer = newAllPathsRenderer();

          return this.renderer;
        },
        render: (resetGraphVisual = true) => {
          this.resetGraphVisual();
          paths.forEach((path) => path.render(false));
        },
        resetGraphVisual: () => this.resetGraphVisual(),
      },
      paths: [...paths].reverse(),
      computingTime: endTime - startTime,
      resetGraphVisual: () => this.resetGraphVisual(),
    };
  }

  *pathRenderer(path: PathSegment[], resetGraphVisual = false) {
    yield;

    if (resetGraphVisual) {
      this.resetGraphVisual();
    }

    if (path.length === 0) {
      return;
    }

    const renderEndpoints = () => {
      const startingNode = path[0].from ?? path[0].to;
      const endingSegment =
        path[path.length - 1].to ?? path[path.length - 1].from;

      if (startingNode) {
        this.makeAction(
          AlgorithmActionType.HIGHLIGHT_ENDPOINTS,
          startingNode
        ).perform();
      }

      if (endingSegment) {
        this.makeAction(
          AlgorithmActionType.HIGHLIGHT_ENDPOINTS,
          endingSegment
        ).perform();
      }
    };

    yield;

    for (let i = 0; i < path.length; i++) {
      const { from, to, edge } = path[i];

      const startingNode = from ?? to;

      if (startingNode) {
        this.makeAction(
          i === 0
            ? AlgorithmActionType.HIGHLIGHT_ENDPOINTS
            : AlgorithmActionType.BUILD_PATH_NODE,
          startingNode
        ).perform();
      }

      if (edge) {
        if (edge.source === from) {
          edge
            .makeChangeStateAction(AlgorithmActionType.SHOW_EDGE_DIRECTION, {
              showArrowIn: true,
            })
            .perform();
        } else {
          edge
            .makeChangeStateAction(AlgorithmActionType.SHOW_EDGE_DIRECTION, {
              showArrowOut: true,
            })
            .perform();
        }

        this.makeAction(AlgorithmActionType.BUILD_PATH_EDGE, edge).perform();
      }

      const endingNode = to ?? from;

      if (endingNode) {
        this.makeAction(
          i === path.length - 1
            ? AlgorithmActionType.HIGHLIGHT_ENDPOINTS
            : AlgorithmActionType.BUILD_PATH_NODE,
          endingNode
        ).perform();
      }

      renderEndpoints();

      yield;
    }
  }

  renderPath(path: PathSegment[], resetGraphVisual = false) {
    const renderer = this.pathRenderer(path, resetGraphVisual);

    while (!renderer.next().done);
  }

  *startGenerator(locations: NodeElement[]) {
    this.emptyActions();

    if (locations.length < 2) {
      throw new Error("Not enough locations, must be at least 2");
    }

    locations = locations.filter((location) => location);

    const path = new Array<NodeElement>();

    this.resetGraphVisual();

    let visited: Record<string, any> = {};

    for (let i = 0; i < locations.length - 1; i++) {
      this.parentMap.clear();
      const gen = this.processGenerator(locations[i], locations[i + 1]);
      let subVisited = {
        ...visited,
      };

      while (true) {
        const { value, done } = gen.next();

        if (value) {
          for (const [key, v] of Object.entries(value)) {
            if (key in visited) {
              subVisited[key] = visited[key] + v;
            } else {
              subVisited[key] = v;
            }
          }
        }

        yield subVisited;
        if (done) {
          break;
        }
      }

      visited = {
        ...visited,
        ...subVisited,
      };

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

  abstract processGenerator(
    start: NodeElement,
    end: NodeElement,
    skipActions?: boolean
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

  emptyActions() {
    while (this.actions.length > 0) {
      this.actions.pop();
    }
  }
}
