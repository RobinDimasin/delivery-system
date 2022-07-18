<script lang="ts">
  import type NodeElement from "../../functions/elements/Node/NodeElement";
  import { locations } from "../../store/store";

  export let node: NodeElement;
  export let editable = false;

  $: location = $locations.find((location) => location.node === node);
  $: name = location ? location.name : node.state.label;
</script>

<div class="flex">
  <svg
    xmlns="http://www.w3.org/2000/svg"
    class="h-5 w-5 my-auto"
    viewBox="0 0 20 20"
    fill={location ? location.color : "currentColor"}
  >
    <path
      fill-rule="evenodd"
      d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
      clip-rule="evenodd"
    />
  </svg>
  {#if !editable}
    <p class="my-auto px-2 font-bold text-black">{name}</p>
  {:else}
    <input
      type="text"
      placeholder="Type here"
      class="input input-xs w-full max-w-xs input-primary"
      value={name}
      on:input={(e) => {
        locations.update((locations) => {
          return locations.map((loc) => {
            if (loc === location) {
              // @ts-ignore
              loc.name = e.target.value;
              node.state.label = loc.name;
            }

            return loc;
          });
        });
      }}
    />
  {/if}
</div>
