import { MinPriorityQueue } from "@datastructures-js/priority-queue";
import { current_component } from "svelte/internal";
import NodeElement from "../../elements/Node/NodeElement";
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

  process(start: NodeElement, end: NodeElement): AlgorithmAction[] {
    const actions = new Array<AlgorithmAction>();

    const visited = new Set<NodeElement>();
  
    const frontier = new MinPriorityQueue<{ fcost: number; node: NodeElement }>(
      ({ fcost }) => fcost
    );
    frontier.push({ fcost: 0, node: start });
    const came_from = new Map<NodeElement, NodeElement>();
    came_from.set(start, null);
    const cost_so_far = new Map<NodeElement, number>();
    cost_so_far.set(start, 0);
    
    const heuristic = (node: NodeElement, node1: NodeElement) => {
      return Math.hypot(node.x - node1.x, node.y - node1.y)
    }

    actions.push(
      this.makeAction(AlgorithmActionType.HIGHLIGHT_ENDPOINTS, start)
    );

    actions.push(this.makeAction(AlgorithmActionType.HIGHLIGHT_ENDPOINTS, end));

      while(!frontier.isEmpty()){
        const currNode = frontier.pop().node;

        if(currNode === end){
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

        for (const edge of this.graph.get(currNode)) {
          const neighbor = edge.to;

          if (visited.has(neighbor)) {
            continue;
          }
  
          actions.push(
            this.makeAction(AlgorithmActionType.ENQUEUE_NODE, neighbor)
          );

          const newCost = cost_so_far.get(currNode) + heuristic(currNode, neighbor) ; 
          if(!cost_so_far.has(neighbor) || newCost < cost_so_far.get(neighbor)){
            cost_so_far.set(neighbor, newCost);
            const priority = newCost + heuristic(end, neighbor);
            frontier.push({ fcost: priority, node: neighbor });
            came_from.set(neighbor, currNode);
          }

          if (!(currNode === start || currNode === end)) {
            actions.push(
              this.makeAction(AlgorithmActionType.NODE_PROCESSED, currNode)
            );
          }
      }

    return actions;
  }

  processGenerator(
    start: NodeElement,
    end: NodeElement
  ): IterableIterator<any> {
    throw new Error("Method not implemented.");
  }
}
