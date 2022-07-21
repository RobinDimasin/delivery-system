<script lang="ts">
  import { formatText } from "../functions/utility";

  import { computationStatistics } from "../store/store";
</script>

<div class="absolute top-0 right-0 text-right font-bold p-2">
  {#each Object.entries($computationStatistics) as [key, value] (key)}
    <p>{formatText(key)}: {value}</p>
  {/each}
</div>
