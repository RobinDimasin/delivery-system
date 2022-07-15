import daisyui from "daisyui";

export default {
  plugins: [daisyui],
  theme: {
    extend: {},
  },
  purge: ["./index.html", "./src/**/*.{svelte,js,ts}"], // for unused CSS
  variants: {
    extend: {},
  },
};
