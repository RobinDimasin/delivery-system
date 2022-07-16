<script lang="ts">
  import type { Path } from "src/lib/functions/algorithm/Algorithm";
  import { onDestroy } from "svelte";
  import { formatDistance, round } from "../../functions/utility";

  import { locations, paths } from "../../store/store";
  import NodeInfo from "./NodeInfo.svelte";

  const MAP_TO_REAL_LIFE_RATIO = 361.58 / 99.25;

  const renderers = new Map<Path, ReturnType<typeof setInterval>>();

  let selectedPath: Path | undefined;
  let isShowingAll = false;
  let showingPath = new Set<Path>();
  let showAllInterval: ReturnType<typeof setInterval> | undefined;

  const speedRange = {
    min: 0.5,
    max: 5,
    numberOfSteps: 9,
    default: 1,
  };

  let speed = speedRange.default;
  const baseYieldInterval = 50;

  $: yieldInterval = baseYieldInterval / speed;

  $: {
    yieldInterval;

    console.log({ yieldInterval });
  }

  const clearShowingPath = () => {
    showingPath.clear();
    showingPath = showingPath;
  };

  const stopRenderers = () => {
    [...renderers].forEach(([path, interval]) => {
      clearInterval(interval);
      path.resetGraphVisual();
    });
  };

  onDestroy(() => {
    stopShowingAll();
    stopRenderers();
  });

  const startPathRendering = (path: Path, reset = true) => {
    if (isShowingAll) return;
    if (reset) {
      stopPathRendering(path);
      path.resetRenderer();
    }

    let last = new Date().getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const need = Math.floor((now - last) / yieldInterval);

      for (let i = 0; i < need; i++) {
        if (!renderers.has(path)) {
          clearInterval(interval);
          break;
        }

        const { done } = path.renderer.next();
        if (done) {
          path.render(true);
        }
        last = new Date().getTime();
        if (done) {
          break;
        }
      }
    }, 100);

    if (reset) {
      const existingRenderer = renderers.get(path);

      if (existingRenderer) {
        clearInterval(existingRenderer);
        renderers.delete(path);
      }

      renderers.set(path, interval);
    }
  };

  const stopPathRendering = (path: Path) => {
    if (path) {
      clearInterval(renderers.get(path));
      renderers.delete(path);
      path.resetGraphVisual();
    }
  };

  const selectPath = (path: Path) => {
    if (isShowingAll) {
      return;
    }

    stopPathRendering(selectedPath);

    selectedPath = path;

    startPathRendering(selectedPath, !renderers.has(selectedPath));
  };

  const deselectPath = () => {
    if (isShowingAll) {
      return;
    }

    if (selectedPath) {
      stopPathRendering(selectedPath);
      selectedPath = null;
    }
  };

  const showAll = () => {
    clearInterval(showAllInterval);
    const _paths = [...$paths].reverse();

    if (_paths.length === 0) {
      return;
    }

    _paths[0].resetGraphVisual();

    let last = new Date().getTime();
    let pathIndex = 0;

    for (const path of _paths) {
      path.resetRenderer();
    }

    showAllInterval = setInterval(() => {
      const now = new Date().getTime();
      const need = Math.floor((now - last) / yieldInterval);

      for (let i = 0; i < need; i++) {
        clearShowingPath();

        if (pathIndex >= _paths.length) {
          for (const path of _paths) {
            showingPath.add(path);
            path.render(false);
          }
          break;
        }

        showingPath.add(_paths[pathIndex]);

        const { done } = _paths[pathIndex].renderer.next();
        last = new Date().getTime();
        if (done) {
          pathIndex++;
          break;
        }
      }
    }, 100);
  };

  const stopShowingAll = () => {
    clearInterval(showAllInterval);
    stopRenderers();
    clearShowingPath();

    if ($paths.length > 0) {
      $paths[0].resetGraphVisual();
    }
  };

  $: totalDistance = $paths.reduce(
    (distance, path) => distance + path.distance,
    0
  );

  $: {
    $paths;
    isShowingAll = false;
  }

  $: if (isShowingAll) {
    clearShowingPath();
    stopRenderers();
    showAll();
  }

  $: if (!isShowingAll) {
    stopShowingAll();
  }
</script>

{#if $paths.length > 0}
  <div class="card card-compact bg-base-100 shadow-xl">
    <div class="card-body space-y-1">
      <div class="card-title flex justify-between">
        <p>Routes</p>
      </div>

      {#if $paths.length === 0}
        <div class="p-2 border-2 border-dashed text-center">
          <p class="uppercase font-bold text-gray-600">Empty</p>
        </div>
      {:else}
        <div class="p-2 border-2 border-primary text-right">
          <div class="text-gray-600 ">
            <div class="flex justify-between">
              <div class="flex">
                <NodeInfo node={$paths[$paths.length - 1].start} />
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
                <NodeInfo node={$paths[0].end} />
              </div>
              <div>
                <span
                  >{formatDistance(
                    totalDistance * MAP_TO_REAL_LIFE_RATIO
                  )}</span
                >
                <span class={selectedPath ? "cursor-not-allowed" : ""}>
                  <button
                    class={`btn btn-xs btn-outline border-dashed border-2 ${
                      !isShowingAll ? "btn-primary" : "btn-error"
                    } ${selectedPath ? "btn-disabled" : ""}`}
                    on:click={() => {
                      if (!selectedPath) {
                        isShowingAll = !isShowingAll;
                      }
                    }}
                  >
                    {#if !isShowingAll}
                      <p>Show</p>
                    {:else}
                      <p>Stop</p>
                    {/if}
                  </button>
                </span>
              </div>
            </div>
          </div>
        </div>
      {/if}

      <div
        class="max-h-32 overflow-y-auto space-y-1 space-y-reverse flex flex-col-reverse"
      >
        {#if $paths.length > 1}
          {#each $paths as path (path.start.id + path.end.id)}
            <div
              class={`p-2 border-2 border-dashed hover:bg-base-300 ${
                selectedPath === path || showingPath.has(path)
                  ? "bg-base-300"
                  : ""
              }`}
            >
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
                  <span class={isShowingAll ? "cursor-not-allowed" : ""}
                    ><button
                      class={`btn btn-xs btn-outline border-dashed border-2 ${
                        selectedPath !== path ? "btn-primary" : "btn-error"
                      } ${
                        isShowingAll || (selectedPath !== path && selectedPath)
                          ? "btn-disabled"
                          : ""
                      }`}
                      on:click={() => {
                        if (!isShowingAll) {
                          if (selectedPath !== path) {
                            selectPath(path);
                          } else {
                            deselectPath();
                          }
                        }
                      }}
                    >
                      {#if selectedPath !== path}
                        <p>Show</p>
                      {:else}
                        <p>Stop</p>
                      {/if}
                    </button></span
                  >
                </div>
              </div>
            </div>
          {/each}
        {/if}
      </div>
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
