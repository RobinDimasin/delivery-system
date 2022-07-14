import type EdgeElement from "../../elements/Edge/EdgeElement";
import type NodeElement from "../../elements/Node/NodeElement";
import Algorithm, { AlgorithmType, GraphInput } from "../Algorithm";

export default class DFS extends Algorithm {
  constructor() {
    super(AlgorithmType.DFS);
  }

  start(start: NodeElement, end: NodeElement, graph: GraphInput) {
    const visited = new Set<NodeElement>();

    const events: Array<() => void> = [];

    const nodeEdges = new Map<NodeElement, EdgeElement[]>();

    for (const node of graph.nodes) {
      nodeEdges.set(
        node,
        graph.edges.filter(
          (edge) =>
            edge.config.source.id === node.id ||
            edge.config.target.id === node.id
        )
      );
    }

    const stack = [start];

    events.push(() => {
      start.state.fill = "blue";
      start.state.radius = 8;
      end.state.fill = "red";
      end.state.radius = 8;
    });

    const parentMap = new Map<NodeElement, NodeElement>();

    while (stack.length > 0) {
      const node = stack.pop();

      if (!(node === start || node === end)) {
        events.push(() => {
          node.state.fill = "lime";
          node.state.radius = 3;
        });
      }

      if (node === end) {
        let child = end;
        while (parentMap.has(child)) {
          if (child !== node) {
            const _child = child;
            events.push(() => {
              _child.state.fill = "red";
              _child.state.radius = 4;
            });
          }

          const parent = parentMap.get(child);

          if (parent) {
            const edge = nodeEdges
              .get(child)
              .find(
                (edge) =>
                  edge.config.source === parent || edge.config.target === parent
              );

            if (edge) {
              events.push(() => {
                edge.state.stroke = "red";
                edge.state.strokeWeight = 3;
              });
            }
          }

          child = parent;
        }
        break;
      }

      if (visited.has(node)) {
        continue;
      }

      visited.add(node);

      const edges = [...nodeEdges.get(node)];

      while (edges.length > 0) {
        const edge = edges.pop();
        const nodes = [edge.config.source, edge.config.target];
        for (const child of nodes) {
          if (!visited.has(child)) {
            parentMap.set(child, node);
            if (child !== end) {
              events.push(() => {
                child.state.fill = "gray";
                child.state.radius = 5;
              });
            }
            stack.push(child);
          }
        }
      }
    }

    return events;
  }
}
