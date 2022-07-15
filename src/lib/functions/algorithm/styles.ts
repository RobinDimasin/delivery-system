import { increaseBrightness } from "../utility";

const AlgorithmStyles = {
  NODE: {
    DEFAULT: {
      fill: "black",
      radius: 2,
      scaleWithZoom: false,
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
      fill: "blue",
      radius: 8,
      scaleWithZoom: true,
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
    },
  },
  EDGE: {
    DEFAULT: {
      showArrowIn: false,
      showArrowOut: false,
      stroke: "#000",
      strokeWeight: 1,
    },
    PROCESSED: {
      stroke: "#45AD18",
      strokeWeight: 3,
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
