<script lang="ts">
  import {
    isSelectingLocation,
    locations,
    networkGraph,
    algorithm,
    algorithmResult,
    isComputingPath as isAlgorithmComputing,
  } from "../../store/store";
  import type { Location } from "../../store/store";
  import NodeInfo from "./NodeInfo.svelte";
  import { delay } from "../../functions/utility";

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
      {#if $locations.length >= 2}
        <button
          class="btn btn-primary btn-sm"
          on:click={async () => {
            const algo = new $algorithm({
              nodes: $networkGraph.nodes,
              edges: $networkGraph.edges,
            });

            isAlgorithmComputing.set(true);

            algorithmResult.set(
              algo.compute(
                [...$locations].reverse().map((location) => location.node)
              )
            );

            isAlgorithmComputing.set(false);
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
              d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2H6zm1 2a1 1 0 000 2h6a1 1 0 100-2H7zm6 7a1 1 0 011 1v3a1 1 0 11-2 0v-3a1 1 0 011-1zm-3 3a1 1 0 100 2h.01a1 1 0 100-2H10zm-4 1a1 1 0 011-1h.01a1 1 0 110 2H7a1 1 0 01-1-1zm1-4a1 1 0 100 2h.01a1 1 0 100-2H7zm2 1a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1zm4-4a1 1 0 100 2h.01a1 1 0 100-2H13zM9 9a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1zM7 8a1 1 0 000 2h.01a1 1 0 000-2H7z"
              clip-rule="evenodd"
            />
          </svg>
          <p>Calculate Route</p>
        </button>
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
