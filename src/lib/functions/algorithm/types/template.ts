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

export default class AStar extends Algorithm {
  constructor(graph: GraphRawInput) {
    super(AlgorithmType.ASTAR, graph);
  }

  process(start: NodeElement, end: NodeElement): AlgorithmAction[] {
    const actions = new Array<AlgorithmAction>();

    // Code here

    return actions;
  }
}
