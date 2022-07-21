import { increaseBrightness } from "../utility";

export const DEFAULT = "__DEFAULT__" as const;
export type DefaultType = typeof DEFAULT;

const AlgorithmStyles = {
  NODE: {
    STATELESS: {
      fill: "#000",
      radius: 2,
      scaleWithZoom: false,
      endpoint: false,
      alwaysShow: false,
    },
    DEFAULT: {
      fill: DEFAULT,
      radius: DEFAULT,
      scaleWithZoom: DEFAULT,
    },
    QUEUED: {
      fill: "gray",
      radius: 3,
    },
    PROCESSING: {
      fill: "cyan",
      radius: 4,
    },
    PROCESSED: {
      fill: "#45AD18",
      radius: 3,
    },
    ENDPOINT: {
      fill: DEFAULT,
      radius: 8,
      scaleWithZoom: true,
      alwaysShow: true,
    },
    FINAL_PATH: {
      fill: (brightess: number) => {
        const color = "#FF0000";
        if (!brightess) {
          return color;
        }
        return increaseBrightness(color, brightess);
      },
      radius: 4,
      alwaysShow: DEFAULT,
    },
  },
  EDGE: {
    STATELESS: {
      showArrowIn: false,
      showArrowOut: false,
      stroke: "#000",
      strokeWeight: 1,
      scaleWithZoom: false,
    },
    DEFAULT: {
      showArrowIn: DEFAULT,
      showArrowOut: DEFAULT,
      stroke: DEFAULT,
      strokeWeight: DEFAULT,
      scaleWithZoom: DEFAULT,
    },
    PROCESSED: {
      stroke: "#45AD18",
      strokeWeight: 2,
      scaleWithZoom: true,
    },
    FINAL_PATH: {
      stroke: (brightess: number) => {
        const color = "#FF0000";
        if (!brightess) {
          return color;
        }
        return increaseBrightness(color, brightess);
      },
      scaleWithZoom: true,
      strokeWeight: 3,
    },
  },
};

export default AlgorithmStyles;
