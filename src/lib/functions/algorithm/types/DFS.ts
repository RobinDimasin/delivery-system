import type NodeElement from "../../elements/Node/NodeElement";
import { increaseBrightness } from "../../utility";
import Algorithm, {
  AlgorithmAction,
  AlgorithmActionType,
  AlgorithmType,
  GraphInput,
} from "../Algorithm";

export default class DFS extends Algorithm {
  constructor() {
    super(AlgorithmType.DFS);
  }

  process(start: NodeElement, end: NodeElement, graph: GraphInput) {
    const visited = new Set<NodeElement>();

    // Functions to call when playing the visualization; change color, size, etc...
    const actions = new Array<AlgorithmAction>();

    const stack = [start];

    // Make starting node color red
    actions.push(
      start.makeChangeStateAction(AlgorithmActionType.HIGHLIGHT_ENDPOINTS, {
        fill: "red",
        radius: 8,
      })
    );

    // Make ending node color red
    actions.push(
      end.makeChangeStateAction(AlgorithmActionType.HIGHLIGHT_ENDPOINTS, {
        fill: "red",
        radius: 8,
      })
    );

    // Mapping of nodes to their parent
    const parentMap = new Map<NodeElement, NodeElement>();

    while (stack.length > 0) {
      const node = stack.pop();

      // Make currently processing node color lime
      if (!(node === start || node === end)) {
        actions.push(
          node.makeChangeStateAction(AlgorithmActionType.PROCESS_NODE, {
            fill: "lime",
            radius: 3,
          })
        );
      }

      // Backtrack the path from the end node to the start node, if the end node is reached
      if (node === end) {
        let child = end;
        while (parentMap.has(child)) {
          if (child !== node) {
            actions.push(
              child.makeChangeStateAction(AlgorithmActionType.BUILD_PATH_NODE, {
                fill: (brightess) => {
                  if (!brightess) {
                    return "red";
                  }
                  return increaseBrightness("#FF0000", brightess);
                },
                radius: 4,
              })
            );
          }

          const parent = parentMap.get(child);

          if (parent) {
            const edge = graph
              .get(child)
              .find(
                (edge) =>
                  edge.element.config.source === parent ||
                  edge.element.config.target === parent
              );

            if (edge) {
              actions.push(
                edge.element.makeChangeStateAction(
                  AlgorithmActionType.BUILD_PATH_EDGE,
                  {
                    stroke: (brightess) => {
                      if (!brightess) {
                        return "red";
                      }
                      return increaseBrightness("#FF0000", brightess);
                    },
                    strokeWeight: 3,
                  }
                )
              );
            }
          }

          child = parent;
        }
        break;
      }

      // Skip if node is already visited
      if (visited.has(node)) {
        continue;
      }

      // Add node to visited
      visited.add(node);

      const edges = [...graph.get(node)];

      // Add all neighboring nodes to the stack
      while (edges.length > 0) {
        const child = edges.pop().to;
        if (!visited.has(child)) {
          parentMap.set(child, node);

          // Make the neighboring node color gray, indicating it is in the stack
          actions.push(
            child.makeChangeStateAction(AlgorithmActionType.ENQUEUE_NODE, {
              fill: "gray",
              radius: 4,
            })
          );
          stack.push(child);
        }
      }
    }

    return actions;
  }
}
