import { writable } from "svelte/store";
import type NodeElement from "../functions/elements/Node/NodeElement";
import type PolygonElement from "../functions/elements/Polygon/PolygonElement";
import type NetworkGraphCanvas from "../functions/NetworkGraphCanvas";

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

export const locations = writable<Location[]>([]);
export const areas = writable<Area[]>([]);

export const isSelectingLocation = writable(false);
export const isEditing = writable(false);

export const isLabellingArea = writable(false);
export const isMakingArea = writable(false);
export const editingPolygon = writable<PolygonElement | undefined>();

export const networkGraph = writable<NetworkGraphCanvas | undefined>();
