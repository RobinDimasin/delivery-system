<script lang="ts">
  import { onDestroy } from "svelte";

  import {
    algorithmResults,
    computationStatistics,
    isVisualizationPaused,
    yieldInterval,
  } from "../../store/store";
  import type { Renderer } from "../../functions/types";
  import AlgorithmResult from "./AlgorithmResult.svelte";
  import SpeedInput from "./SpeedInput.svelte";

  let currentRendererInterval: ReturnType<typeof setInterval> | undefined;
  let currentRenderer: Renderer | undefined;
  const knownComputations = new Set<string>();

  const stopRenderer = () => {
    computationStatistics.set({});
    isVisualizationPaused.set(false);
    if (currentRenderer) {
      currentRenderer.resetGraphVisual();
    }
    clearInterval(currentRendererInterval);
    currentRenderer = null;
  };

  const startRenderer = (renderer: Renderer) => {
    isVisualizationPaused.set(false);
    stopRenderer();
    currentRenderer = renderer;
    renderer.resetGraphVisual();
    renderer.resetRenderer();

    let last = new Date().getTime();

    currentRendererInterval = setInterval(() => {
      const now = new Date().getTime();
      const need = Math.floor((now - last) / $yieldInterval);

      for (let i = 0; i < need && !$isVisualizationPaused; i++) {
        const { value, done } = renderer.renderer.next();
        if (value) {
          computationStatistics.set(value);
        }
        if (done) {
          renderer.render(true);
        }
        last = new Date().getTime();
        if (done) {
          break;
        }
      }

      if ($isVisualizationPaused) {
        last = new Date().getTime();
      }
    }, 50);
  };

  onDestroy(() => {
    stopRenderer();
  });

  $: if ($algorithmResults[0]) {
    const id = $algorithmResults[0].id;
    $algorithmResults[0].resetGraphVisual();

    if (!knownComputations.has(id)) {
      startRenderer($algorithmResults[0].process);
      knownComputations.add(id);
    }
  }
</script>

{#if $algorithmResults.length > 0}
  <SpeedInput />
{/if}

{#each $algorithmResults as algorithmResult (algorithmResult.process)}
  <AlgorithmResult
    {algorithmResult}
    {startRenderer}
    {stopRenderer}
    {currentRenderer}
  />
{/each}
