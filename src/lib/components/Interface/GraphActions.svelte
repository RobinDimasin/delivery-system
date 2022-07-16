<script lang="ts">
  import { downloadJson } from "../../functions/utility";
  import {
    locations,
    networkGraph,
    areas,
    graph,
    algorithm,
    paths,
  } from "../../store/store";
  import graphSmall from "../../data/graph_small.json";
  import graphBig from "../../data/graph.json";
  $: $networkGraph.setGraph($graph);
</script>

<div class="card card-compact bg-base-100 shadow-xl">
  <div class="card-body space-y-1">
    <div class="flex justify-between">
      <button
        class="btn btn-primary btn-xs"
        on:click={() => downloadJson($networkGraph.toJSON())}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
            clip-rule="evenodd"
          />
        </svg> Graph
      </button>
      <button
        class="btn btn-primary btn-xs"
        on:click={() => {
          graph.set(graphSmall);
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z"
            clip-rule="evenodd"
          />
        </svg> Small Graph
      </button>
    </div>
    <div class="flex justify-between">
      <button
        class="btn btn-primary btn-xs"
        on:click={() =>
          downloadJson(
            $areas.map((area) => {
              return {
                points: area.polygon.nodes.map((node) => {
                  return {
                    x: node.x,
                    y: node.y,
                  };
                }),
                label: area.label,
                color: area.color,
              };
            })
          )}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
            clip-rule="evenodd"
          />
        </svg> Labels
      </button>
      <button
        class="btn btn-primary btn-xs"
        on:click={() => {
          graph.set(graphBig);
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z"
            clip-rule="evenodd"
          />
        </svg> Big Graph
      </button>
    </div>
  </div>
</div>
