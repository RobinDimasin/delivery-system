import { MinPriorityQueue } from "@datastructures-js/priority-queue";
import EdgeElement from "../../elements/Edge/EdgeElement";
import NodeElement from "../../elements/Node/NodeElement";
import { increaseBrightness } from "../../utility";
import Algorithm, {
  AlgorithmAction,
  AlgorithmActionType,
  AlgorithmType,
  GraphInput,
  GraphRawInput,
} from "../Algorithm";

export default class DIJKSTRA extends Algorithm {
  constructor(graph: GraphRawInput) {
    super(AlgorithmType.DIJKSTRA, graph);
  }

  process(
    start: NodeElement,
    end: NodeElement
  ): AlgorithmAction[] {
    const actions = new Array<AlgorithmAction>();
    
    //variables
    const visited = new Set<NodeElement>();
    const distances = new Map<NodeElement, number>();
    const pq = new MinPriorityQueue<{dist: number; node: NodeElement}>(
      ({dist}) => dist
    );
    const weightedGraph = new Map<NodeElement, {to: NodeElement; weight: number}[]>();

    distances.set(start, 0);
    pq.push({dist: 0, node:start});

    for(const node of this.graph.keys()){
      if(node !== start){
        distances.set(node, Infinity)
      }
    }

    for(const [node, edges] of this.graph.entries()){
      weightedGraph.set(
        node,
        edges.map((edge) => {
          const x1 = edge.element.source.x;
          const y1 = edge.element.source.y;
          const x2 = edge.element.source.x;
          const y2 = edge.element.source.y;
          return{
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


    while(!pq.isEmpty){
      const minNode = pq.dequeue();

      if (visited.has(minNode) {
        continue;
      }

      if (!(minNode.node === start || minNode.node === end)) {
        actions.push(
          this.makeAction(AlgorithmActionType.START_PROCESSING_NODE, node)
        );
      }

      visited.add(minNode.node);

      actions.push(this.showCurrentPath(start, minNode.node));

      const currNode = minNode.node;
      const dist = Math.min(distances.get(currNode), minNode.dist)
      distances.set(currNode, dist);
      for(const edge of weightedGraph.get(currNode)){
        
        if (visited.has(edge.to) {
          continue;
        }

        const neighbor = edge.to;

        actions.push(
          this.makeAction(AlgorithmActionType.ENQUEUE_NODE, edge.to)
        );

        if (!(neighbor === start || neighbor === end)) {
          actions.push(this.makeAction(AlgorithmActionType.NODE_PROCESSED, node));
        }

        const alt = distances.get(currNode) + edge.weight;
        if(alt < distances.get(neighbor)){
          distances.set(neighbor, alt);
          this.parentMap.set(neighbor, currNode)
          pq.push({dist: alt, node: neighbor});
        }
      }
    }
    return actions;
  }
}
