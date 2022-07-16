<script lang="ts">
  import Title from "./Interface/Title.svelte";
  import Locations from "./Interface/Locations.svelte";
  import Areas from "./Interface/Areas.svelte";
  import Config from "./Interface/Config.svelte";
  import GraphActions from "./Interface/GraphActions.svelte";
  import Paths from "./Interface/Paths.svelte";
</script>

<div
  class="absolute top-0 left-0 w-48 md:w-96 min-h-screen bg-base-100 p-8 space-y-2 shadow-2xl overflow-auto max-h-screen"
>
  <Title />
  <Locations />
  <Paths />
  <GraphActions />
  <Areas />
  <Config />

  <slot />
</div>

<style>
</style>
