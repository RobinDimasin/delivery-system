<script lang="ts">
  import { algorithmResults, isVisualizationPaused } from "../../store/store";

  import type Algorithm from "../../functions/algorithm/Algorithm";
  import type { Renderer } from "../../functions/types";
  import {
    capitalize,
    formatDistance,
    formatText,
    round,
  } from "../../functions/utility";
  import NodeInfo from "./NodeInfo.svelte";

  const MAP_TO_REAL_LIFE_RATIO = 361.58 / 99.25;

  export let algorithmResult: ReturnType<Algorithm["compute"]>;
  export let startRenderer: (renderer: Renderer) => void;
  export let stopRenderer: () => void;
  export let currentRenderer: Renderer;

  const totalDistance = algorithmResult.paths.reduce(
    (distance, path) => distance + path.distance,
    0
  );
</script>

<div
  tabindex="0"
  class="collapse border border-base-300 bg-base-100 rounded-box shadow-xl"
>
  <input type="checkbox" class="!w-7/12" />
  <div class="collapse-title flex justify-between !pr-4">
    <div class="flex h-auto">
      <div class="m-auto">
        <div>
          <b>{capitalize(algorithmResult.algorithmUsed)}</b>
        </div>
        <div class="text-xs">
          <p>Runtime: {round(algorithmResult.computingTime, 4)}ms</p>
          {#each Object.entries(algorithmResult.process.visited) as [key, value] (key)}
            <p>{formatText(key)}: {value}</p>
          {/each}
        </div>
      </div>
    </div>

    <div>
      {#if currentRenderer === algorithmResult.process}
        <button
          class={`btn btn-sm btn-outline border-dashed border-2 btn-primary`}
          on:click={() => {
            isVisualizationPaused.set(!$isVisualizationPaused);
          }}
        >
          {#if !$isVisualizationPaused}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                clip-rule="evenodd"
              />
            </svg>
          {:else}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                clip-rule="evenodd"
              />
            </svg>
          {/if}
        </button>
      {/if}
      <button
        class={`btn btn-sm btn-outline border-dashed border-2 ${
          currentRenderer === algorithmResult.process
            ? "btn-error"
            : "btn-primary"
        }`}
        on:click={() => {
          if (currentRenderer !== algorithmResult.process) {
            startRenderer(algorithmResult.process);
          } else {
            stopRenderer();
          }
        }}
      >
        {#if currentRenderer === algorithmResult.process}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z"
              clip-rule="evenodd"
            />
          </svg>
        {:else}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
              clip-rule="evenodd"
            />
          </svg>
        {/if}
      </button>
      <button
        class="btn btn-sm btn-error"
        on:click={() => {
          algorithmResults.update((algorithmResults) => {
            stopRenderer();
            return algorithmResults.filter((a) => a !== algorithmResult);
          });
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
            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
            clip-rule="evenodd"
          />
        </svg>
      </button>
    </div>
  </div>
  <div class="collapse-content space-y-1">
    {#if algorithmResult.paths.length === 0}
      <div class="p-2 border-2 border-dashed text-center">
        <p class="uppercase font-bold text-gray-600">No Possible Route Found</p>
      </div>
    {:else}
      <div class="p-2 border-2 border-primary text-right ">
        <div class="text-gray-600 ">
          <div class="flex justify-between">
            <div class="flex">
              <NodeInfo
                node={algorithmResult.paths[algorithmResult.paths.length - 1]
                  .start}
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                  clip-rule="evenodd"
                />
              </svg>
              <NodeInfo node={algorithmResult.paths[0].end} />
            </div>
            <div>
              <span
                >{formatDistance(totalDistance * MAP_TO_REAL_LIFE_RATIO)}</span
              >
              <span>
                <button
                  class={`btn btn-xs btn-outline border-dashed border-2 ${
                    currentRenderer === algorithmResult.allPaths
                      ? "btn-error"
                      : "btn-primary"
                  }`}
                  on:click={() => {
                    if (currentRenderer !== algorithmResult.allPaths) {
                      startRenderer(algorithmResult.allPaths);
                    } else {
                      stopRenderer();
                    }
                  }}
                >
                  {#if currentRenderer === algorithmResult.allPaths}
                    <p>Stop</p>
                  {:else}
                    <p>Show</p>
                  {/if}
                </button>
              </span>
            </div>
          </div>
        </div>
      </div>
      <div
        class="max-h-32 overflow-y-auto space-y-1 space-y-reverse flex flex-col-reverse"
      >
        {#if algorithmResult.paths.length > 1}
          {#each algorithmResult.paths as path (path.start.id + path.end.id)}
            <div class="p-2 border-2 border-dashed hover:bg-base-300">
              <div class="flex justify-between">
                <div class="flex">
                  <NodeInfo node={path.start} />
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  <NodeInfo node={path.end} />
                </div>
                <div>
                  <span
                    >{formatDistance(
                      path.distance * MAP_TO_REAL_LIFE_RATIO
                    )}</span
                  >
                  <span
                    ><button
                      class={`btn btn-xs btn-outline border-dashed border-2 ${
                        currentRenderer === path ? "btn-error" : "btn-primary"
                      } `}
                      on:click={() => {
                        if (currentRenderer !== path) {
                          startRenderer(path);
                        } else {
                          stopRenderer();
                        }
                      }}
                    >
                      {#if currentRenderer === path}
                        <p>Stop</p>
                      {:else}
                        <p>Show</p>
                      {/if}
                    </button></span
                  >
                </div>
              </div>
            </div>
          {/each}
        {/if}
      </div>
    {/if}
  </div>
</div>
