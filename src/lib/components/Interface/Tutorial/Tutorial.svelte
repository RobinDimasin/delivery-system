<script lang="ts">
  import { onMount, type SvelteComponent } from "svelte";

  type Component = {
    title: string | ((page: number) => string);
    component: SvelteComponent;
  };

  export let components: Component[];
  export let startIndex = 0;
  export let id: string;
  export let show = true;

  let currentIndex = startIndex;
  let selectedComponent: Component | undefined;
  let openButton: HTMLLabelElement;
  let closeButton: HTMLLabelElement;
  $: key = `${id}-show`;

  $: {
    if (currentIndex >= 0 && currentIndex <= components.length - 1) {
      selectedComponent = components[currentIndex];
    } else {
      selectedComponent = null;
    }
  }

  const setShow = (b: boolean) => {
    if (window && window.localStorage) {
      show = b;
      window.localStorage.setItem(key, `${show}`);
    }
  };

  onMount(() => {
    if (window && window.localStorage) {
      const value = window.localStorage.getItem(key);

      if (typeof value === "string") {
        show = window.localStorage.getItem(key) === "true";
      } else {
        show = true;
      }
    } else {
      show = true;
    }

    if (show) {
      openButton.click();
    }

    setShow(show);
  });
</script>

{#if show !== undefined}
  <label
    for="my-modal-4"
    class="flex align-middle modal-button absolute bottom-0 right-0 text-warning p-2 duration-300 hover:-translate-y-1 hover:cursor-pointer"
    bind:this={openButton}
    on:click={() => (currentIndex = 0)}
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="h-5 w-5 my-auto"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fill-rule="evenodd"
        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
        clip-rule="evenodd"
      />
    </svg>
    <div class="my-auto">Tutorial</div>
  </label>

  <!-- Put this part before </body> tag -->
  <input type="checkbox" id="my-modal-4" class="modal-toggle" />
  <label for="my-modal-4" class="modal cursor-pointer !m-0">
    <label class="modal-box relative" for="">
      <label
        for="my-modal-4"
        class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
        bind:this={closeButton}>✕</label
      >
      {#if selectedComponent}
        <h3 class="text-lg font-bold">
          {typeof selectedComponent.title === "string"
            ? selectedComponent.title
            : selectedComponent.title(currentIndex)} ({currentIndex +
            1}/{components.length})
        </h3>
      {/if}
      <p class="py-4 h-64">
        {#if selectedComponent}
          <svelte:component this={selectedComponent.component} class="" />
        {:else}
          <p>Nothing to see here</p>
        {/if}
      </p>
      <div class="flex justify-between">
        <div class="form-control">
          <label class="label cursor-pointer space-x-2">
            <input
              type="checkbox"
              checked={!show}
              class="checkbox checkbox-primary"
              on:change={(e) => {
                // @ts-ignore
                setShow(!e.target.checked);
              }}
            />
            <span class="label-text">Do not show this again</span>
          </label>
        </div>
        <div class="space-x-2">
          {#if components.length > 1}
            {#if currentIndex > 0}
              <button
                class={`btn btn-primary ${
                  currentIndex > 0 ? "" : "btn-disabled"
                }`}
                on:click={() => {
                  currentIndex = Math.max(0, currentIndex - 1);
                }}
              >
                Previous
              </button>
            {/if}
            <button
              class={`btn btn-primary ${
                currentIndex < components.length - 1 ? "" : "btn-outline"
              }`}
              on:click={() => {
                if (currentIndex < components.length - 1) {
                  currentIndex = Math.min(
                    currentIndex + 1,
                    components.length - 1
                  );
                } else {
                  closeButton.click();
                }
              }}
            >
              {#if currentIndex < components.length - 1}
                Next
              {:else}
                Close
              {/if}
            </button>
          {/if}
        </div>
      </div>
    </label>
  </label>
{/if}
