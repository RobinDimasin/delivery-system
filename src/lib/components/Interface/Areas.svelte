<script lang="ts">
  import {
    isEditing,
    isLabellingArea,
    areas,
    isMakingArea,
    editingPolygon,
    networkGraph,
  } from "../../store/store";
  import { isSelectingLocation } from "../../store/store";
  import PolygonElement from "../../functions/elements/Polygon/PolygonElement";
  import labels from "../../data/labels.json";

  isLabellingArea.subscribe((value) => {
    if (value) {
      isEditing.set(false);
    }
  });
</script>

<div class="card card-compact bg-base-100 shadow-xl">
  <div class="card-body space-y-1">
    <div class="card-title flex justify-between">
      <p>Areas</p>
      <button
        class={"btn btn-primary btn-sm btn-outline border-dashed border-2 " +
          ($isMakingArea ? "invisible" : "visible")}
        on:click={() => {
          isMakingArea.set(true);
          const polygon = new PolygonElement({
            label: "Area",
          });
          editingPolygon.set(polygon);
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
            d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
            clip-rule="evenodd"
          />
        </svg>
        <p>New</p>
      </button>
    </div>
    <div
      class="max-h-32 overflow-y-auto space-y-1 space-y-reverse flex flex-col-reverse"
    >
      {#if $areas.length === 0 && !$isMakingArea}
        <div class="p-2 border-2 border-dashed text-center">
          <p class="uppercase font-bold text-gray-600">Empty</p>
        </div>
      {/if}

      {#if $isMakingArea}
        <div
          class="flex justify-between cursor-pointer p-2 border-2 border-base-300 border-dashed bg-base-200"
        >
          <p class="my-auto"><i>Select locations</i></p>
          <button
            class="btn btn-success btn-xs hover:scale-105 mr-2"
            on:click={() => {
              isSelectingLocation.set(false);
              if ($editingPolygon && $editingPolygon.points.length > 2) {
                areas.update((areas) => {
                  return [
                    ...areas,
                    {
                      polygon: $editingPolygon,
                      label: $editingPolygon.state.label,
                      color: $editingPolygon.state.fill,
                    },
                  ];
                });
              }
              editingPolygon.set(undefined);
              isMakingArea.set(false);
            }}>Done</button
          >
          <button
            class="btn btn-error btn-xs hover:scale-105"
            on:click={() => {
              isSelectingLocation.set(false);

              if ($editingPolygon) {
                $networkGraph.deleteElement($editingPolygon);
              }

              editingPolygon.set(undefined);
              isMakingArea.set(false);
            }}>Cancel</button
          >
        </div>
      {/if}

      {#each $areas as area (area.polygon.id)}
        <div
          class="flex justify-between cursor-pointer p-2 border-2 border-dashed hover:bg-base-200"
          on:mouseover={() => (area.polygon.state.hovering = true)}
          on:focus={() => (area.polygon.state.hovering = true)}
          on:mouseout={() => (area.polygon.state.hovering = false)}
          on:blur={() => (area.polygon.state.hovering = false)}
        >
          <div class="flex">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5 my-auto"
              viewBox="0 0 20 20"
              fill={area.color}
            >
              <path
                fill-rule="evenodd"
                d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                clip-rule="evenodd"
              />
            </svg>
            <!-- <p class="my-auto px-2 font-bold text-black">
                  {area.label}
                </p> -->
            <input
              type="text"
              placeholder="Type here"
              class="input input-xs w-full max-w-xs input-primary"
              value={area.label}
              on:input={(e) => {
                // @ts-ignore
                area.label = e.target.value;
                area.polygon.state.label = area.label;
              }}
            />
          </div>
          <input
            type="checkbox"
            class="toggle toggle-primary"
            checked={!area.polygon.hidden}
            on:change={(e) => {
              // @ts-ignore
              const isChecked = !!e.target.checked;

              area.polygon.hidden = !isChecked;
            }}
          />
          <button
            class="btn btn-square btn-error btn-xs hover:scale-105"
            on:click={() => {
              areas.update((areas) =>
                areas.filter((a) => a.polygon !== area.polygon)
              );
              $networkGraph.deleteElement(area.polygon);
              area.polygon.state.hovering = false;
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
  </div>
</div>
