import { MinPriorityQueue } from "@datastructures-js/priority-queue";
import EdgeElement from "../../elements/Edge/EdgeElement";
import type NodeElement from "../../elements/Node/NodeElement";
import { increaseBrightness } from "../../utility";
import Algorithm, {
  AlgorithmAction,
  AlgorithmActionType,
  AlgorithmType,
  GraphInput,
  GraphRawInput,
} from "../Algorithm";

export default class Dijkstra extends Algorithm {
  constructor(graph: GraphRawInput) {
    super(AlgorithmType.DIJKSTRA, graph);
  }

  process(start: NodeElement, end: NodeElement): AlgorithmAction[] {
    const actions = new Array<AlgorithmAction>();

    //variables
    const visited = new Set<NodeElement>();
    const distances = new Map<NodeElement, number>();
    const pq = new MinPriorityQueue<{ dist: number; node: NodeElement }>(
      ({ dist }) => dist
    );
    const weightedGraph = new Map<
      NodeElement,
      { to: NodeElement; weight: number }[]
    >();

    distances.set(start, 0);
    pq.push({ dist: 0, node: start });

    for (const node of this.graph.keys()) {
      if (node !== start) {
        distances.set(node, Infinity);
      }
    }

    for (const [node, edges] of this.graph.entries()) {
      weightedGraph.set(
        node,
        edges.map((edge) => {
          const x1 = edge.element.source.x;
          const y1 = edge.element.source.y;
          const x2 = edge.element.target.x;
          const y2 = edge.element.target.y;
          return {
            to: edge.to,
            weight: Math.hypot(x1 - x2, y1 - y2),
          };
        })
      );
    }

    actions.push(
      this.makeAction(AlgorithmActionType.HIGHLIGHT_ENDPOINTS, start)
    );

    actions.push(this.makeAction(AlgorithmActionType.HIGHLIGHT_ENDPOINTS, end));

    while (!pq.isEmpty()) {
      const minNode = pq.dequeue();
      const currNode = minNode.node;

      if (currNode === end) {
        const buildPathActions = this.buildPath(start, currNode);
        actions.push(...buildPathActions);
        break;
      }

      if (visited.has(currNode)) {
        continue;
      }

      if (!(currNode === start || currNode === end)) {
        actions.push(
          this.makeAction(AlgorithmActionType.START_PROCESSING_NODE, currNode)
        );
      }

      visited.add(currNode);

      actions.push(this.showCurrentPath(start, currNode));

      const dist = Math.min(distances.get(currNode), minNode.dist);
      distances.set(currNode, dist);
      for (const edge of weightedGraph.get(currNode)) {
        const neighbor = edge.to;

        if (visited.has(neighbor)) {
          continue;
        }

        actions.push(
          this.makeAction(AlgorithmActionType.ENQUEUE_NODE, neighbor)
        );

        const alt = distances.get(currNode) + edge.weight;
        if (alt < distances.get(neighbor)) {
          distances.set(neighbor, alt);
          this.parentMap.set(neighbor, currNode);
          pq.push({ dist: alt, node: neighbor });
        }
      }

      if (!(currNode === start || currNode === end)) {
        actions.push(
          this.makeAction(AlgorithmActionType.NODE_PROCESSED, currNode)
        );
      }
    }

    return actions;
  }

  *processGenerator(start: NodeElement, end: NodeElement) {
    //variables
    const visited = new Set<NodeElement>();
    const distances = new Map<NodeElement, number>();
    const pq = new MinPriorityQueue<{ dist: number; node: NodeElement }>(
      ({ dist }) => dist
    );
    const weightedGraph = new Map<
      NodeElement,
      { to: NodeElement; weight: number }[]
    >();

    distances.set(start, 0);
    pq.push({ dist: 0, node: start });

    for (const node of this.graph.keys()) {
      if (node !== start) {
        distances.set(node, Infinity);
      }
    }

    for (const [node, edges] of this.graph.entries()) {
      weightedGraph.set(
        node,
        edges.map((edge) => {
          const x1 = edge.element.source.x;
          const y1 = edge.element.source.y;
          const x2 = edge.element.target.x;
          const y2 = edge.element.target.y;
          return {
            to: edge.to,
            weight: Math.hypot(x1 - x2, y1 - y2),
          };
        })
      );
    }

    this.makeAction(AlgorithmActionType.HIGHLIGHT_ENDPOINTS, start).perform();

    this.makeAction(AlgorithmActionType.HIGHLIGHT_ENDPOINTS, end).perform();
    yield;

    while (!pq.isEmpty()) {
      const minNode = pq.dequeue();
      const currNode = minNode.node;

      if (currNode === end) {
        const buildPathActions = this.buildPath(start, currNode);

        for (const action of buildPathActions) {
          action.perform();
          yield;
        }
        break;
      }

      if (visited.has(currNode)) {
        continue;
      }

      if (!(currNode === start || currNode === end)) {
        this.makeAction(
          AlgorithmActionType.START_PROCESSING_NODE,
          currNode
        ).perform();
        yield;
      }

      visited.add(currNode);

      const dist = Math.min(distances.get(currNode), minNode.dist);
      distances.set(currNode, dist);
      for (const edge of weightedGraph.get(currNode)) {
        const neighbor = edge.to;

        if (visited.has(neighbor)) {
          continue;
        }

        this.makeAction(AlgorithmActionType.ENQUEUE_NODE, neighbor).perform();
        yield;

        const alt = distances.get(currNode) + edge.weight;
        if (alt < distances.get(neighbor)) {
          distances.set(neighbor, alt);
          this.parentMap.set(neighbor, currNode);
          pq.push({ dist: alt, node: neighbor });
        }
      }

      this.showCurrentPath(start, currNode).perform();

      if (!(currNode === start || currNode === end)) {
        this.makeAction(AlgorithmActionType.NODE_PROCESSED, currNode).perform();
      }

      yield;
    }
  }
}
