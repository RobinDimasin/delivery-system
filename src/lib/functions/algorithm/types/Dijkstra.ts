import { MinPriorityQueue } from "@datastructures-js/priority-queue";
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
    const visited = new Set<NodeElement>();

    const weightedGraph = new Map<
      NodeElement,
      { to: NodeElement; weight: number }[]
    >();

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

    const distance = new Map<NodeElement, number>();

    const actions = new Array<AlgorithmAction>();

    const pq = new MinPriorityQueue<{ dist: number; node: NodeElement }>(
      ({ dist }) => dist
    );

    actions.push(
      start.makeChangeStateAction(AlgorithmActionType.HIGHLIGHT_ENDPOINTS, {
        fill: "red",
        radius: 8,
      })
    );

    actions.push(
      end.makeChangeStateAction(AlgorithmActionType.HIGHLIGHT_ENDPOINTS, {
        fill: "red",
        radius: 8,
      })
    );

    pq.push({ dist: 0, node: start });

    while (!pq.isEmpty()) {
      const top = pq.dequeue();

      if (top.node === end) {
        this.buildPath(start, end);
        break;
      }

      if (visited.has(top.node)) {
        continue;
      }

      if (!(top.node === start || top.node === end)) {
        actions.push(
          top.node.makeChangeStateAction(
            AlgorithmActionType.START_PROCESSING_NODE,
            {
              fill: "cyan",
              radius: 5,
            }
          )
        );
      }

      visited.add(top.node);

      actions.push(this.showCurrentPath(start, top.node));

      const dist = Math.min(top.dist, distance.get(top.node) ?? Infinity);

      distance.set(top.node, Math.min(top.dist, dist));

      for (const edge of weightedGraph.get(top.node)) {
        const d = dist + edge.weight;
        if (d < (distance.get(edge.to) ?? Infinity) && !visited.has(edge.to)) {
          distance.set(edge.to, d);
          pq.push({ dist: d, node: edge.to });
          actions.push(
            edge.to.makeChangeStateAction(AlgorithmActionType.ENQUEUE_NODE, {
              fill: "gray",
              radius: 4,
            })
          );
          this.parentMap.set(edge.to, top.node);
        }
      }

      if (!(top.node === start || top.node === end)) {
        actions.push(
          top.node.makeChangeStateAction(AlgorithmActionType.PROCESSED_NODE, {
            fill: "#4CFF00",
            radius: 3,
          })
        );
      }
    }

    return actions;
  }

  *processGenerator(start: NodeElement, end: NodeElement) {
    const visited = new Set<NodeElement>();

    const weightedGraph = new Map<
      NodeElement,
      { to: NodeElement; weight: number }[]
    >();

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

    const distance = new Map<NodeElement, number>();

    const actions = new Array<AlgorithmAction>();

    const pq = new MinPriorityQueue<{ dist: number; node: NodeElement }>(
      ({ dist }) => dist
    );

    // Make starting node color red
    this.makeAction(
      AlgorithmActionType.HIGHLIGHT_ENDPOINTS,
      start,
      false
    ).perform();

    // Make ending node color red
    this.makeAction(AlgorithmActionType.HIGHLIGHT_ENDPOINTS, end).perform();
    yield;

    yield;

    pq.push({ dist: 0, node: start });

    while (!pq.isEmpty()) {
      const top = pq.dequeue();

      if (top.node === end) {
        const buildPathActions = this.buildPath(start, end);

        this.resetGraphVisual();

        for (const action of buildPathActions) {
          action.perform();
          yield;
        }
        break;
      }

      if (visited.has(top.node)) {
        continue;
      }

      if (!(top.node === start || top.node === end)) {
        top.node
          .makeChangeStateAction(AlgorithmActionType.START_PROCESSING_NODE, {
            fill: "cyan",
            radius: 5,
          })
          .perform();
        yield;
      }

      visited.add(top.node);

      const dist = Math.min(top.dist, distance.get(top.node) ?? Infinity);

      distance.set(top.node, Math.min(top.dist, dist));

      for (const edge of weightedGraph.get(top.node)) {
        const d = dist + edge.weight;
        if (d < (distance.get(edge.to) ?? Infinity) && !visited.has(edge.to)) {
          distance.set(edge.to, d);
          pq.push({ dist: d, node: edge.to });
          edge.to
            .makeChangeStateAction(AlgorithmActionType.ENQUEUE_NODE, {
              fill: "gray",
              radius: 4,
            })
            .perform();
          yield;
          this.parentMap.set(edge.to, top.node);
        }
      }

      this.showCurrentPath(start, top.node).perform();

      if (!(top.node === start || top.node === end)) {
        top.node
          .makeChangeStateAction(AlgorithmActionType.PROCESSED_NODE, {
            fill: "#4CFF00",
            radius: 3,
          })
          .perform();
        yield;
      }
    }
  }
}
