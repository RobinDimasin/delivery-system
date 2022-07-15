<script lang="ts">
  import Graph from "./lib/components/Graph.svelte";
  import Interface from "./lib/components/Interface.svelte";
  import TailwindCSS from "./lib/components/TailwindCSS.svelte";
</script>

<main>
  <TailwindCSS />
  <!-- <Interface /> -->
  <Graph />
</main>

<style>
  :root {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
      Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  }
</style>
