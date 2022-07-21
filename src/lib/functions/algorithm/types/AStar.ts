import { MinPriorityQueue } from "@datastructures-js/priority-queue";
import { current_component } from "svelte/internal";
import type EdgeElement from "../../elements/Edge/EdgeElement";
import type NodeElement from "../../elements/Node/NodeElement";
import { increaseBrightness } from "../../utility";
import Algorithm, {
  AlgorithmAction,
  AlgorithmActionType,
  AlgorithmType,
  GraphInput,
  GraphRawInput,
} from "../Algorithm";

export default class AStar extends Algorithm {
  constructor(graph: GraphRawInput) {
    super(AlgorithmType.ASTAR, graph);
  }

  *processGenerator(
    start: NodeElement,
    end: NodeElement,
    skipActions?: boolean
  ) {
    const actions = new Array<AlgorithmAction>();

    const visited = new Set<NodeElement>();
    const visitedEdges = new Set<EdgeElement>();

    const frontier = new MinPriorityQueue<{ fcost: number; node: NodeElement }>(
      ({ fcost }) => fcost
    );

    frontier.push({ fcost: 0, node: start });
    const came_from = new Map<NodeElement, NodeElement>();
    came_from.set(start, null);
    const cost_so_far = new Map<NodeElement, number>();
    cost_so_far.set(start, 0);

    const heuristic = (node: NodeElement, node1: NodeElement) => {
      return Math.hypot(node.x - node1.x, node.y - node1.y);
    };

    if (!skipActions) {
      this.makeAction(AlgorithmActionType.HIGHLIGHT_ENDPOINTS, start).perform();

      this.makeAction(AlgorithmActionType.HIGHLIGHT_ENDPOINTS, end).perform();
      yield;
    }

    while (!frontier.isEmpty()) {
      const currNode = frontier.pop().node;

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

      if (!skipActions) {
        if (!(currNode === start || currNode === end)) {
          this.makeAction(
            AlgorithmActionType.START_PROCESSING_NODE,
            currNode
          ).perform();
        }
      }

      visited.add(currNode);

      for (const edge of this.graph.get(currNode)) {
        const neighbor = edge.to;

        visitedEdges.add(edge.element);

        if (!skipActions) {
          this.makeAction(
            AlgorithmActionType.PROCESSED_EDGE,
            edge.element
          ).perform();
          yield;
        }

        if (visited.has(neighbor)) {
          continue;
        }

        if (!skipActions) {
          this.makeAction(AlgorithmActionType.ENQUEUE_NODE, neighbor).perform();
          yield;
        }

        const newCost =
          cost_so_far.get(currNode) + heuristic(currNode, neighbor);
        if (!cost_so_far.has(neighbor) || newCost < cost_so_far.get(neighbor)) {
          cost_so_far.set(neighbor, newCost);
          const priority = newCost + heuristic(end, neighbor);
          frontier.push({ fcost: priority, node: neighbor });
          this.parentMap.set(neighbor, currNode);
          came_from.set(neighbor, currNode);
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
        yield;
      }

      yield {
        visited_nodes: visited.size,
        visited_edges: visitedEdges.size,
      };
    }

    return actions;
  }
}
