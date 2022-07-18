import { writable } from "svelte/store";
import type { GraphRawInput, Path } from "../functions/algorithm/Algorithm";
import type Algorithm from "../functions/algorithm/Algorithm";
import Dijkstra from "../functions/algorithm/types/Dijkstra";
import type NodeElement from "../functions/elements/Node/NodeElement";
import type PolygonElement from "../functions/elements/Polygon/PolygonElement";
import NetworkGraphCanvas from "../functions/NetworkGraphCanvas";
import graphSmall from "../data/graph_small.json";
import graphBig from "../data/graph.json";
import DFS from "../functions/algorithm/types/DFS";

export type Location = {
  node: NodeElement;
  name: string;
  color: string;
};

export type Area = {
  polygon: PolygonElement;
  label: string;
  color: string;
};

export type Node = {
  id: string;
  x: number;
  y: number;
};

export type Edge = {
  source: string;
  target: string;
};

export type Graph = {
  nodes: Node[];
  edges: Edge[];
};

export const graph = writable<Graph>(graphBig);
export const networkGraph = writable(new NetworkGraphCanvas({}));
export const algorithm = writable<new (graph: GraphRawInput) => Algorithm>(DFS);
export const algorithmResults = writable<ReturnType<Algorithm["compute"]>[]>(
  []
);
export const isComputingPath = writable<boolean | undefined>(undefined);

export const locations = writable<Location[]>([]);
export const areas = writable<Area[]>([]);

export const isSelectingLocation = writable(false);
export const isEditing = writable(false);

export const isLabellingArea = writable(false);
export const isMakingArea = writable(false);
export const editingPolygon = writable<PolygonElement | undefined>();
export const yieldInterval = writable(100);
