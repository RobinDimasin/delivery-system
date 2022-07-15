import { increaseBrightness } from "../utility";

const AlgorithmStyles = {
  NODE: {
    QUEUED: {
      fill: "gray",
      radius: 3,
    },
    PROCESSING: {
      fill: "cyan",
      radius: 4,
    },
    PROCESSED: {
      fill: "lime",
      radius: 3,
    },
    ENDPOINT: {
      fill: "red",
      radius: 8,
    },
    FINAL_PATH: {
      fill: (brightess) => {
        if (!brightess) {
          return "red";
        }
        return increaseBrightness("#FF0000", brightess);
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
    FINAL_PATH: {
      stroke: (brightess) => {
        if (!brightess) {
          return "red";
        }
        return increaseBrightness("#FF0000", brightess);
      },
      strokeWeight: 3,
    },
  },
};

export default AlgorithmStyles;
