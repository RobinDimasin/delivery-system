import type EdgeElement from "../../elements/Edge/EdgeElement";
import type NodeElement from "../../elements/Node/NodeElement";
import Algorithm, {
  AlgorithmAction,
  AlgorithmActionType,
  AlgorithmType,
  GraphRawInput,
} from "../Algorithm";

export default class DFS extends Algorithm {
  constructor(graph: GraphRawInput) {
    super(AlgorithmType.DFS, graph);
  }

  *processGenerator(start: NodeElement, end: NodeElement, skipActions = false) {
    const visited = new Set<NodeElement>();
    const visitedEdges = new Set<EdgeElement>();

    const stack = [start];

    // Functions to call when playing the visualization; change color, size, etc...
    const actions = new Array<AlgorithmAction>();

    if (!skipActions) {
      // Make starting node color red
      this.makeAction(
        AlgorithmActionType.HIGHLIGHT_ENDPOINTS,
        start,
        false
      ).perform();

      // Make ending node color red
      this.makeAction(AlgorithmActionType.HIGHLIGHT_ENDPOINTS, end).perform();
      yield;
    }

    while (stack.length > 0) {
      const node = stack.pop();

      // Backtrack the path from the end node to the start node, if the end node is reached
      if (node === end) {
        if (!skipActions) {
          const buildPathActions = this.buildPath(start, node);

          for (const action of buildPathActions) {
            action.perform();
            yield;
          }
        }
        break;
      }

      // Skip if node is already visited
      if (visited.has(node)) {
        continue;
      }

      if (!skipActions) {
        // Make currently processing node color cyan
        if (!(node === start || node === end)) {
          this.makeAction(
            AlgorithmActionType.START_PROCESSING_NODE,
            node
          ).perform();
          yield;
        }
      }

      // Add node to visited
      visited.add(node);

      const edges = [...this.graph.get(node)];

      // Add all neighboring nodes to the stack
      while (edges.length > 0) {
        const edge = edges.pop();
        const child = edge.to;
        visitedEdges.add(edge.element);

        if (!skipActions) {
          this.makeAction(
            AlgorithmActionType.PROCESSED_EDGE,
            edge.element
          ).perform();
          yield;
        }

        if (!visited.has(child)) {
          this.parentMap.set(child, node);

          if (!skipActions) {
            // Make the neighboring node color gray, indicating it is in the stack
            if (!(node === start || node === end)) {
              this.makeAction(
                AlgorithmActionType.ENQUEUE_NODE,
                child
              ).perform();
            }
          }
          stack.push(child);
          yield;
        }

        this.makeAction(
          AlgorithmActionType.PROCESSED_EDGE,
          edge.element
        ).perform();

        yield {
          visited_nodes: visited.size,
          visited_edges: visitedEdges.size,
        };
      }

      if (!skipActions) {
        this.showCurrentPath(start, node).perform();

        // Make newly processed node color lime
        if (!(node === start || node === end)) {
          this.makeAction(AlgorithmActionType.NODE_PROCESSED, node).perform();
          yield;
        }
      }
    }
  }
}
