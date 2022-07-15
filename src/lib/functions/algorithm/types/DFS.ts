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

  process(start: NodeElement, end: NodeElement) {
    const visited = new Set<NodeElement>();

    const stack = [start];

    // Functions to call when playing the visualization; change color, size, etc...
    const actions = new Array<AlgorithmAction>();

    // Make starting node color red
    actions.push(
      this.makeAction(AlgorithmActionType.HIGHLIGHT_ENDPOINTS, start)
    );

    // Make ending node color red
    actions.push(this.makeAction(AlgorithmActionType.HIGHLIGHT_ENDPOINTS, end));

    while (stack.length > 0) {
      const node = stack.pop();

      // Backtrack the path from the end node to the start node, if the end node is reached
      if (node === end) {
        const buildPathActions = this.buildPath(start, node);
        actions.push(...buildPathActions);
        break;
      }

      // Skip if node is already visited
      if (visited.has(node)) {
        continue;
      }

      // Make currently processing node color cyan
      if (!(node === start || node === end)) {
        actions.push(
          this.makeAction(AlgorithmActionType.START_PROCESSING_NODE, node)
        );
      }

      // Add node to visited
      visited.add(node);

      actions.push(this.showCurrentPath(start, node));

      const edges = [...this.graph.get(node)];

      // Add all neighboring nodes to the stack
      while (edges.length > 0) {
        const child = edges.pop().to;
        if (!visited.has(child)) {
          this.parentMap.set(child, node);

          // Make the neighboring node color gray, indicating it is in the stack
          actions.push(
            this.makeAction(AlgorithmActionType.ENQUEUE_NODE, child)
          );
          stack.push(child);
        }
      }

      // Make newly processed node color lime
      if (!(node === start || node === end)) {
        actions.push(this.makeAction(AlgorithmActionType.NODE_PROCESSED, node));
      }
    }

    return actions;
  }

  *processGenerator(start: NodeElement, end: NodeElement) {
    const visited = new Set<NodeElement>();

    const stack = [start];

    // Functions to call when playing the visualization; change color, size, etc...
    const actions = new Array<AlgorithmAction>();
    console.log(start, end);
    // Make starting node color red
    this.makeAction(
      AlgorithmActionType.HIGHLIGHT_ENDPOINTS,
      start,
      false
    ).perform();

    // Make ending node color red
    this.makeAction(AlgorithmActionType.HIGHLIGHT_ENDPOINTS, end).perform();
    yield;

    while (stack.length > 0) {
      const node = stack.pop();

      // Backtrack the path from the end node to the start node, if the end node is reached
      if (node === end) {
        const buildPathActions = this.buildPath(start, node);

        for (const action of buildPathActions) {
          action.perform();
          yield;
        }
        break;
      }

      // Skip if node is already visited
      if (visited.has(node)) {
        continue;
      }

      // Make currently processing node color cyan
      if (!(node === start || node === end)) {
        this.makeAction(
          AlgorithmActionType.START_PROCESSING_NODE,
          node
        ).perform();
        yield;
      }

      // Add node to visited
      visited.add(node);

      const edges = [...this.graph.get(node)];

      // Add all neighboring nodes to the stack
      while (edges.length > 0) {
        const edge = edges.pop();
        const child = edge.to;

        if (!visited.has(child)) {
          this.parentMap.set(child, node);

          // Make the neighboring node color gray, indicating it is in the stack
          this.makeAction(AlgorithmActionType.ENQUEUE_NODE, child).perform();
          stack.push(child);
          yield;
        }

        this.makeAction(
          AlgorithmActionType.PROCESSED_EDGE,
          edge.element
        ).perform();
        yield;
      }

      this.showCurrentPath(start, node).perform();

      // Make newly processed node color lime
      if (!(node === start || node === end)) {
        this.makeAction(AlgorithmActionType.NODE_PROCESSED, node).perform();
        yield;
      }
    }
  }
}
