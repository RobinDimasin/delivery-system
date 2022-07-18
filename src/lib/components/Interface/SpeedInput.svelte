<script lang="ts">
  import { round } from "../../functions/utility";
  import { yieldInterval } from "../../store/store";

  const speedRange = {
    min: 1,
    max: 21,
    numberOfSteps: 10,
    default: 1,
  };

  let speed = speedRange.default;
  const baseYieldInterval = 50;

  $: yieldInterval.set(baseYieldInterval / speed);
</script>

<div class="card card-compact bg-base-100 shadow-xl">
  <div class="card-body space-y-1">
    <div class="card-title">
      <p>Speed</p>
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
            i * ((speedRange.max - speedRange.min) / speedRange.numberOfSteps) +
              speedRange.min,
            1
          )}x</span
        >
      {/each}
    </div>
  </div>
</div>
