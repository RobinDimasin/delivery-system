import { writable } from "svelte/store";
import type NodeElement from "../functions/elements/Node/NodeElement";

export type Location = {
  node: NodeElement;
  name: string;
  color: string;
};

export const locations = writable<Location[]>([]);

export const isSelectingLocation = writable(false);
export const isEditing = writable(false);
