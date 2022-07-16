export const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const downloadJson = (data: Object) => {
  const dataStr =
    "data:text/json;charset=utf-8," +
    encodeURIComponent(JSON.stringify(data, null, 2));
  const downloadAnchorNode = document.createElement("a");
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", new Date().getTime() + ".json");
  document.body.appendChild(downloadAnchorNode); // required for firefox
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
};

export function increaseBrightness(hex: string, percent: number) {
  // strip the leading # if it's there
  hex = hex.replace(/^\s*#|\s*$/g, "");

  // convert 3 char codes --> 6, e.g. `E0F` --> `EE00FF`
  if (hex.length == 3) {
    hex = hex.replace(/(.)/g, "$1$1");
  }

  const r = parseInt(hex.substr(0, 2), 16),
    g = parseInt(hex.substr(2, 2), 16),
    b = parseInt(hex.substr(4, 2), 16);

  return (
    "#" +
    (0 | ((1 << 8) + r + ((256 - r) * percent) / 100)).toString(16).substr(1) +
    (0 | ((1 << 8) + g + ((256 - g) * percent) / 100)).toString(16).substr(1) +
    (0 | ((1 << 8) + b + ((256 - b) * percent) / 100)).toString(16).substr(1)
  );
}

function byte2Hex(n) {
  const nybHexString = "0123456789ABCDEF";
  return (
    String(nybHexString.substr((n >> 4) & 0x0f, 1)) +
    nybHexString.substr(n & 0x0f, 1)
  );
}

function RGB2Color(r: number, g: number, b: number) {
  return "#" + byte2Hex(r) + byte2Hex(g) + byte2Hex(b);
}

export function rainbowColor(value: number) {
  const frequency1 = 0.3;
  const frequency2 = 0.3;
  const frequency3 = 0.3;
  const width = 127;
  const center = 64;

  const red = Math.sin(frequency1 * value + 0) * width + center;
  const grn = Math.sin(frequency2 * value + 2) * width + center;
  const blu = Math.sin(frequency3 * value + 4) * width + center;

  return RGB2Color(red, grn, blu);
}

export function makeAlphabetID(value: number) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  let id = "";

  if (value === 0) {
    return alphabet[0];
  }

  while (value > 0) {
    id += alphabet[value % alphabet.length];
    value = Math.floor(value / alphabet.length);
  }

  return id.split("").reverse().join("");
}

const colors = [
  "#C74440",
  "#2D70B3",
  "#388C46",
  "#FFCE00",
  "#FA7E19",
  "#6042A6",
];

export function makeColor(value: number) {
  return colors[value % colors.length];
}

export function randomColor() {
  const random = () => Math.floor(Math.random() * 256);
  return RGB2Color(random(), random(), random());
}

function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

export function colorAlpha(color: string, alpha: number) {
  const { r, g, b } = hexToRgb(color);
  return "rgba(" + [r, g, b, alpha].join(",") + ")";
}

type Point = {
  x: number;
  y: number;
};

export function isPointInsidePolygon(point: Point, polygon: Point[]) {
  // ray-casting algorithm based on
  // https://wrf.ecse.rpi.edu/Research/Short_Notes/pnpoly.html/pnpoly.html

  const { x, y } = point;

  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x,
      yi = polygon[i].y;
    const xj = polygon[j].x,
      yj = polygon[j].y;

    const intersect =
      yi > y != yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }

  return inside;
}

function getAreaOfPolygon(polygon: Point[]) {
  let area = 0;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i, i++) {
    const point1 = polygon[i];
    const point2 = polygon[j];
    area += point1.x * point2.y;
    area -= point1.y * point2.x;
  }

  area /= 2;

  return area;
}

export function getCenterOfPolygon(polygon: Point[]): Point {
  let x = 0,
    y = 0,
    f = 0;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i, i++) {
    const point1 = polygon[i];
    const point2 = polygon[j];
    f = point1.x * point2.y - point2.x * point1.y;
    x += (point1.x + point2.x) * f;
    y += (point1.y + point2.y) * f;
  }

  f = getAreaOfPolygon(polygon) * 6;

  return {
    x: x / f,
    y: y / f,
  };
}
