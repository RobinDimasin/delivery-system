<script lang="ts">
  import ComputationStatistics from "./lib/components/ComputationStatistics.svelte";

  import Graph from "./lib/components/Graph.svelte";
  import Interface from "./lib/components/Interface.svelte";
  import ColorLabelsInVisualization from "./lib/components/Interface/Tutorial/Pages/ColorLabelsInVisualization.svelte";
  import Controls from "./lib/components/Interface/Tutorial/Pages/Controls.svelte";
  import HowToAddALocation from "./lib/components/Interface/Tutorial/Pages/HowToAddALocation.svelte";
  import HowToCalculateRoute from "./lib/components/Interface/Tutorial/Pages/HowToCalculateRoute.svelte";
  import HowToVisualizeCertainSegmentInRoute from "./lib/components/Interface/Tutorial/Pages/HowToVisualizeCertainSegmentInRoute.svelte";
  import HowToVisualizeRoute from "./lib/components/Interface/Tutorial/Pages/HowToVisualizeRoute.svelte";
  import Welcome from "./lib/components/Interface/Tutorial/Pages/Welcome.svelte";
  import Tutorial from "./lib/components/Interface/Tutorial/Tutorial.svelte";
  import TailwindCSS from "./lib/components/TailwindCSS.svelte";
</script>

<main>
  <TailwindCSS />
  <Interface />
  <Graph />
  <ComputationStatistics />

  <Tutorial
    id="tutorial"
    components={[
      {
        title: "Welcome to My Route Manila",
        component: Welcome,
      },
      {
        title: "Controls",
        component: Controls,
      },
      {
        title: "How to add a location?",
        component: HowToAddALocation,
      },
      {
        title: "How to calculate the route?",
        component: HowToCalculateRoute,
      },
      {
        title: "How to visualize the route?",
        component: HowToVisualizeRoute,
      },
      {
        title: "How to visualize certain segment of a route?",
        component: HowToVisualizeCertainSegmentInRoute,
      },
      {
        title: "What do colors in the visualization mean?",
        component: ColorLabelsInVisualization,
      },
    ]}
  />
</main>

<style>
  :root {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
      Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  }
</style>
