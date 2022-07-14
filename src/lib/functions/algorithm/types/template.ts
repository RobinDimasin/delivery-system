import { MinPriorityQueue } from "@datastructures-js/priority-queue";
import type NodeElement from "../../elements/Node/NodeElement";
import { increaseBrightness } from "../../utility";
import Algorithm, {
  AlgorithmAction,
  AlgorithmActionType,
  AlgorithmType,
  GraphInput,
} from "../Algorithm";

export default class AStar extends Algorithm {
  constructor() {
    super(AlgorithmType.ASTAR);
  }

  process(
    start: NodeElement,
    end: NodeElement,
    graph: GraphInput
  ): AlgorithmAction[] {
    const actions = new Array<AlgorithmAction>();

    // Code here

    return actions;
  }
}
