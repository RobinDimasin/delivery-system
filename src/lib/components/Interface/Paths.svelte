<script lang="ts">
  import type { Renderer } from "p5";

  import type { Path } from "src/lib/functions/algorithm/Algorithm";
  import { onDestroy } from "svelte";
  import { formatDistance, round } from "../../functions/utility";

  import { isComputingPath, algorithmResult } from "../../store/store";
  import NodeInfo from "./NodeInfo.svelte";

  const MAP_TO_REAL_LIFE_RATIO = 361.58 / 99.25;

  const speedRange = {
    min: 1,
    max: 21,
    numberOfSteps: 5,
    default: 1,
  };

  let speed = speedRange.default;
  const baseYieldInterval = 50;

  $: yieldInterval = baseYieldInterval / speed;

  $: {
    yieldInterval;
  }

  type Renderer = {
    renderer: IterableIterator<void>;
    resetRenderer: () => IterableIterator<void>;
    render: (resetGraphVisual: boolean) => void;
    resetGraphVisual: () => void;
  };

  let currentRendererInterval: ReturnType<typeof setInterval> | undefined;
  let currentRenderer: Renderer | undefined;

  const stopRenderer = () => {
    if (currentRenderer) {
      currentRenderer.resetGraphVisual();
    }
    clearInterval(currentRendererInterval);
    currentRenderer = null;
  };

  const startRenderer = (renderer: Renderer) => {
    stopRenderer();
    currentRenderer = renderer;
    renderer.resetRenderer();

    let last = new Date().getTime();

    currentRendererInterval = setInterval(() => {
      const now = new Date().getTime();
      const need = Math.floor((now - last) / yieldInterval);

      for (let i = 0; i < need; i++) {
        const { done } = renderer.renderer.next();
        if (done) {
          renderer.render(true);
        }
        last = new Date().getTime();
        if (done) {
          break;
        }
      }
    }, 100);
  };

  onDestroy(() => {
    stopRenderer();
  });

  $: totalDistance = ($algorithmResult?.paths ?? []).reduce(
    (distance, path) => distance + path.distance,
    0
  );
</script>

{#if $algorithmResult}
  <div class="card card-compact bg-base-100 shadow-xl">
    <div class="card-body space-y-1">
      <div class="card-title flex justify-between">
        <p>Routes</p>
        <button
          class={`btn btn-sm btn-outline border-dashed border-2  ${
            currentRenderer === $algorithmResult.process
              ? "btn-error"
              : "btn-primary"
          }`}
          on:click={() => {
            if (currentRenderer !== $algorithmResult.process) {
              startRenderer($algorithmResult.process);
            } else {
              stopRenderer();
            }
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
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
              clip-rule="evenodd"
            />
          </svg>
          {#if currentRenderer === $algorithmResult.process}
            <p>Stop</p>
          {:else}
            <p>Show Process</p>
          {/if}
        </button>
      </div>
      {#if $algorithmResult.paths.length === 0}
        <div class="p-2 border-2 border-dashed text-center">
          <p class="uppercase font-bold text-gray-600">
            No Possible Route Found
          </p>
        </div>
      {:else}
        <div class="p-2 border-2 border-primary text-right">
          <div class="text-gray-600 ">
            <div class="flex justify-between">
              <div class="flex">
                <NodeInfo
                  node={$algorithmResult.paths[
                    $algorithmResult.paths.length - 1
                  ].start}
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
                <NodeInfo node={$algorithmResult.paths[0].end} />
              </div>
              <div>
                <span
                  >{formatDistance(
                    totalDistance * MAP_TO_REAL_LIFE_RATIO
                  )}</span
                >
                <span>
                  <button
                    class={`btn btn-xs btn-outline border-dashed border-2 ${
                      currentRenderer === $algorithmResult.allPaths
                        ? "btn-error"
                        : "btn-primary"
                    }`}
                    on:click={() => {
                      if (currentRenderer !== $algorithmResult.allPaths) {
                        startRenderer($algorithmResult.allPaths);
                      } else {
                        stopRenderer();
                      }
                    }}
                  >
                    {#if currentRenderer === $algorithmResult.allPaths}
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
          {#if $algorithmResult.paths.length > 1}
            {#each $algorithmResult.paths as path (path.start.id + path.end.id)}
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
      <input
        type="range"
        min={speedRange.min}
        max={speedRange.max}
        value={speed}
        class="range range-xs range-primary"
        step={(speedRange.max - speedRange.min) / speedRange.numberOfSteps}
        on:input={(e) => {
          // @ts-ignore
          speed = parseFloat(e.target.value);
        }}
      />
      <div class="w-full flex justify-between text-xs px-2">
        {#each { length: speedRange.numberOfSteps + 1 } as _, i}
          <span
            >{round(
              i *
                ((speedRange.max - speedRange.min) / speedRange.numberOfSteps) +
                speedRange.min,
              1
            )}x</span
          >
        {/each}
      </div>
    </div>
  </div>
{/if}
