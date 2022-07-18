export type Position = {
  x: number;
  y: number;
};

export type Control = {
  view: {
    x: number;
    y: number;
    zoom: number;
  };
  viewPos: {
    prevX: number | null;
    prevY: number | null;
    isDragging: boolean;
  };
};

export type Renderer = {
  renderer: IterableIterator<void>;
  resetRenderer: () => IterableIterator<void>;
  render: (resetGraphVisual: boolean) => void;
  resetGraphVisual: () => void;
};
