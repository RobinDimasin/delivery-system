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

  *processGenerator(start: NodeElement, end: NodeElement, skipActions = false) {
    //variables
    const visited = new Set<NodeElement>();
    const distances = new Map<NodeElement, number>();
    const pq = new MinPriorityQueue<{ dist: number; node: NodeElement }>(
      ({ dist }) => dist
    );
    distances.set(start, 0);
    pq.push({ dist: 0, node: start });

    for (const node of this.graph.keys()) {
      if (node !== start) {
        distances.set(node, Infinity);
      }
    }

    if (!skipActions) {
      this.makeAction(AlgorithmActionType.HIGHLIGHT_ENDPOINTS, start).perform();

      this.makeAction(AlgorithmActionType.HIGHLIGHT_ENDPOINTS, end).perform();
      yield;
    }

    while (!pq.isEmpty()) {
      const minNode = pq.dequeue();
      const currNode = minNode.node;

      if (currNode === end) {
        if (!skipActions) {
          const buildPathActions = this.buildPath(start, currNode);

          for (const action of buildPathActions) {
            action.perform();
            yield;
          }
        }
        break;
      }

      if (visited.has(currNode)) {
        continue;
      }

      if (!skipActions && !(currNode === start || currNode === end)) {
        this.makeAction(
          AlgorithmActionType.START_PROCESSING_NODE,
          currNode
        ).perform();
        yield;
      }

      visited.add(currNode);

      const dist = Math.min(distances.get(currNode), minNode.dist);
      distances.set(currNode, dist);
      for (const edge of this.graph.get(currNode)) {
        const neighbor = edge.to;

        if (visited.has(neighbor)) {
          continue;
        }

        if (!skipActions) {
          this.makeAction(AlgorithmActionType.ENQUEUE_NODE, neighbor).perform();
          yield;
        }

        const alt =
          dist + Math.hypot(neighbor.x - currNode.x, neighbor.y - currNode.y);
        if (alt < distances.get(neighbor)) {
          distances.set(neighbor, alt);
          this.parentMap.set(neighbor, currNode);
          pq.push({ dist: alt, node: neighbor });
        }
      }

      if (!skipActions) {
        this.showCurrentPath(start, currNode).perform();
        if (!(currNode === start || currNode === end)) {
          this.makeAction(
            AlgorithmActionType.NODE_PROCESSED,
            currNode
          ).perform();
        }
      }

      yield;
    }
  }
}
