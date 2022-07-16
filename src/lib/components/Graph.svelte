<script lang="ts">
  import P5 from "p5-svelte";
  import { makeAlphabetID, makeColor } from "../functions/utility";
  import NodeElement from "../functions/elements/Node/NodeElement";
  import {
    isEditing,
    isSelectingLocation,
    isMakingArea,
    editingPolygon,
    locations,
    networkGraph,
    graph,
    areas,
  } from "../store/store";
  import { onDestroy } from "svelte";
  import labels from "../data/labels.json";
  import PolygonElement from "../functions/elements/Polygon/PolygonElement";

  let mapContainer: HTMLDivElement | undefined;

  isEditing.subscribe((editing) => {
    $networkGraph.setConfig("editable", editing);
  });

  $networkGraph.on("selectElement", ({ element }) => {
    if (element instanceof NodeElement) {
      if ($isSelectingLocation) {
        if ($locations.find(({ node }) => node === element)) {
          return;
        }

        const color = makeColor($locations.length);

        locations.update((locations) => {
          let name: string;
          let tryCount = 0;

          do {
            name = makeAlphabetID(tryCount++);
          } while (locations.find((location) => location.name === name));

          return [{ node: element, name, color }, ...locations];
        });

        $networkGraph.deselectElement();

        element.state.endpoint = true;
        element.state.fill = color;
        element.config.fill = color;
        isSelectingLocation.set(false);
      }
    }
  });

  $networkGraph.on("canvasClick", ({ x, y }) => {
    if (!$isMakingArea || !$editingPolygon) {
      return;
    }

    $networkGraph.addElement($editingPolygon);

    $editingPolygon.addPoint(x, y);
  });

  $: {
    $graph;
    areas.set(
      labels.map(({ points, label, color }) => {
        const polygon = $networkGraph.newElement(PolygonElement, {
          label,
          fill: color,
        });
        for (const point of points) {
          polygon.addPoint(point.x, point.y);
        }
        return {
          polygon,
          label,
          color,
        };
      })
    );
  }
  let destroyed = false;

  onDestroy(() => {
    if (mapContainer) {
      const parent = mapContainer.parentElement;
      if (parent) {
        parent.removeChild(mapContainer);
      }
    }
    destroyed = true;
  });
</script>

<div class="overflow-hidden" bind:this={mapContainer}>
  <P5 sketch={$networkGraph.setup} />
</div>

{#if destroyed}
  <div class="flex h-screen">
    <div class="m-auto text-center">
      <p class="text-xl font-bold">Map failed to load</p>
      <p>Please reload the page</p>
    </div>
  </div>
{/if}

<style>
  :global(body) {
    margin: 0;
    padding: 0;
  }
</style>
