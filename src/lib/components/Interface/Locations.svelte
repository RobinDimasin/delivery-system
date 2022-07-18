<script lang="ts">
  import {
    isSelectingLocation,
    locations,
    networkGraph,
    algorithm,
    algorithmResults,
    isComputingPath as isAlgorithmComputing,
  } from "../../store/store";
  import type { Location } from "../../store/store";
  import NodeInfo from "./NodeInfo.svelte";
  import DFS from "../../functions/algorithm/types/DFS";
  import Dijkstra from "../../functions/algorithm/types/Dijkstra";

  const onLocationHoverIn = (location: Location) => {
    location.node.state.hovering = true;
  };

  const onLocationHoverOut = (location: Location) => {
    location.node.state.hovering = false;
  };

  const onLocationClick = (location: Location) => {
    $networkGraph.handleElementClick(location.node);
  };

  let locationsContainer: HTMLDivElement | undefined;

  const scrollLocationsContainerDown = () => {
    if (locationsContainer) {
      locationsContainer.scrollTop = locationsContainer.scrollHeight;
    }
  };

  isSelectingLocation.subscribe((isSelecting) => {
    if (isSelecting) {
      scrollLocationsContainerDown();
    }
  });

  locations.subscribe(() => {
    if (locationsContainer) {
      scrollLocationsContainerDown();
    }
  });

  const algorithms = [
    {
      name: "Dijkstra",
      algorithm: Dijkstra,
      key: "dijkstra",
    },
    {
      name: "Depth-First Search",
      algorithm: DFS,
      key: "dfs",
    },
  ] as const;

  algorithm.set(algorithms[0].algorithm);
</script>

<div class="card card-compact bg-base-100 shadow-xl">
  <div class="card-body space-y-1">
    <div class="card-title flex justify-between">
      <p>Locations</p>
      <button
        class={"btn btn-primary btn-sm btn-outline border-dashed border-2 " +
          ($isSelectingLocation ? "invisible" : "visible")}
        on:click={() => isSelectingLocation.set(true)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
            clip-rule="evenodd"
          />
        </svg>
        <p>New</p>
      </button>
    </div>
    <div
      class="max-h-32 overflow-y-auto space-y-1 space-y-reverse flex flex-col-reverse"
      bind:this={locationsContainer}
    >
      {#if $locations.length === 0 && !$isSelectingLocation}
        <div class="p-2 border-2 border-dashed text-center">
          <p class="uppercase font-bold text-gray-600">Empty</p>
        </div>
      {/if}

      {#if $isSelectingLocation}
        <div
          class="flex justify-between cursor-pointer p-2 border-2 border-base-300 border-dashed bg-base-200"
        >
          <p class="my-auto"><i>Please select a location</i></p>
          <button
            class="btn btn-error btn-xs hover:scale-105"
            on:click={() => isSelectingLocation.set(false)}>Cancel</button
          >
        </div>
      {/if}

      {#each $locations as location (location.node.id)}
        <div
          class="flex justify-between cursor-pointer p-2 border-2 border-dashed hover:bg-base-200"
          on:mouseover={() => onLocationHoverIn(location)}
          on:focus={() => onLocationHoverIn(location)}
          on:mouseout={() => onLocationHoverOut(location)}
          on:blur={() => onLocationHoverOut(location)}
          on:click={() => onLocationClick(location)}
        >
          <NodeInfo node={location.node} editable={true} />
          <button
            class="btn btn-square btn-error btn-xs hover:scale-105"
            on:click={() => {
              locations.update((locations) =>
                locations.filter((loc) => loc.node !== location.node)
              );

              onLocationHoverOut(location);
              location.node.state.endpoint = false;
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              ><path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              /></svg
            >
          </button>
        </div>
      {/each}
    </div>

    {#if $locations.length > 0}
      <hr />
      {#if $locations.length >= 2}
        <div class="flex justify-between space-x-1">
          <div>
            <select
              class="select select-primary select-sm"
              on:change={(e) => {
                // @ts-ignore
                const value = e.target.value;
                const { algorithm: algo } = algorithms.find(
                  (algorithm) => algorithm.key === value
                );

                algorithm.set(algo);
              }}
            >
              {#each algorithms as algorithm (algorithm.key)}
                <option value={algorithm.key}>{algorithm.name}</option>
              {/each}
            </select>
          </div>
          <button
            class="btn btn-primary btn-sm grow"
            on:click={async () => {
              const algo = new $algorithm({
                nodes: $networkGraph.nodes,
                edges: $networkGraph.edges,
              });

              isAlgorithmComputing.set(true);

              algorithmResults.update((algorithmResults) => {
                return [
                  algo.compute(
                    [...$locations].reverse().map((location) => location.node)
                  ),
                  ...algorithmResults,
                ];
              });

              isAlgorithmComputing.set(false);
            }}
          >
            Calculate Route
          </button>
        </div>
      {:else}
        <button
          class="btn btn-primary btn-sm btn-disabled"
          on:click={() => isSelectingLocation.set(true)}
        >
          <p>Need at least 2 locations</p>
        </button>
      {/if}
    {/if}
  </div>
</div>
