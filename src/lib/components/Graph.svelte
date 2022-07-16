<script lang="ts">
  import P5 from "p5-svelte";
  import DFS from "../functions/algorithm/types/DFS";
  import {
    delay,
    downloadJson,
    makeAlphabetID,
    makeColor,
  } from "../functions/utility";
  import graphBig from "../data/graph.json";
  import graphSmall from "../data/graph_small.json";
  import NetworkGraphCanvas from "../functions/NetworkGraphCanvas";
  import NodeElement from "../functions/elements/Node/NodeElement";
  import type { AlgorithmAction } from "../functions/algorithm/Algorithm";
  import Dijkstra from "../functions/algorithm/types/Dijkstra";
  import Interface from "./Interface.svelte";
  import { createEventDispatcher } from "svelte";
  import { isEditing, isSelectingLocation, locations } from "../store/store";

  const dispatch = createEventDispatcher();

  let width = 900;
  let height = 600;

  let graph = graphSmall;

  const networkGraph = NetworkGraphCanvas.fromJSON(graph, {
    width,
    height,
  });

  isEditing.subscribe((editing) => {
    networkGraph.setConfig("editable", editing);
  });

  networkGraph.on("selectElement", ({ element }) => {
    if (element instanceof NodeElement && $isSelectingLocation) {
      if ($locations.find(({ node }) => node === element)) {
        return;
      }

      const color = makeColor($locations.length);

      locations.update((locations) => {
        let name: string;
        let tryCount = 0;

        do {
          name = makeAlphabetID(tryCount++);
        } while (locations.find((location) => location.name === name));

        return [{ node: element, name, color }, ...locations];
      });

      networkGraph.deselectElement();

      element.state.endpoint = true;
      element.state.fill = color;
      element.config.fill = color;
      isSelectingLocation.set(false);
    }
  });

  let startNode: NodeElement | undefined,
    middleNode: NodeElement | undefined,
    endNode: NodeElement | undefined;
  let algorithm: Dijkstra | undefined;

  let actionIndex = 0;
  // const actions = dfs.start([startNode, middleNode, endNode]);
  let actions: AlgorithmAction[] | undefined;

  let gen: IterableIterator<any> | undefined;

  $: {
    networkGraph.setGraph(graph);

    algorithm = new Dijkstra({
      nodes: networkGraph.nodes,
      edges: networkGraph.edges,
    });
  }

  const previous = () => {
    if (actionIndex >= 0) {
      actions[actionIndex].undo();
      actionIndex--;
    }

    return actionIndex >= 0;
  };

  const next = () => {
    if (actionIndex < actions.length) {
      actions[actionIndex].perform();
      actionIndex++;
    }

    return actionIndex < actions.length;
  };

  let interval;

  let yieldInterval = 1;

  const start = () => {
    clearInterval(interval);

    const started = new Date().getTime();
    let processed = 0;

    interval = setInterval(() => {
      const now = new Date().getTime();
      const expected = Math.floor((now - started) / yieldInterval);

      const need = expected - processed;

      for (let i = 0; i < need; i++) {
        gen.next();
        // next();
        processed++;
      }
    }, 5);
  };

  const stop = () => {
    clearInterval(interval);
  };
</script>

<div class="overflow-hidden">
  <P5 sketch={networkGraph.setup} />
</div>

<Interface
  onLocationHoverIn={({ node }) => {
    node.state.hovering = true;
    // node.state.radius *= 2;
  }}
  onLocationHoverOut={({ node }) => {
    node.state.hovering = false;
    // node.state.radius = node.config.radius;
  }}
  onLocationClick={({ node }) => {
    networkGraph.handleElementClick(node);
  }}
>
  <button
    class="btn btn-primary"
    on:click={() => downloadJson(networkGraph.toJSON())}
  >
    Download Graph
  </button>

  <button
    class="btn btn-primary"
    on:click={() => {
      graph = graphSmall;
    }}
  >
    Load Small Graph
  </button>

  <button
    class="btn btn-primary"
    on:click={() => {
      graph = graphBig;
    }}
  >
    Load Big Graph
  </button>

  {#if actions || gen}
    <!-- <button class="btn btn-primary" on:click={previous}>Previous</button>

    <button class="btn btn-primary" on:click={next}>Next</button> -->
    <button class="btn btn-primary" on:click={start}>Start Visualization</button
    >
    <!-- <button class="btn btn-primary" on:click={stop}>Stop</button> -->
  {:else}
    <button
      class="btn btn-primary"
      on:click={() => {
        // actions = algorithm.start($locations.reverse().map((location) => location.node));
        // actionIndex = 0;
        gen = algorithm.startGenerator(
          $locations.reverse().map((location) => location.node)
        );
      }}
    >
      Compute Path
    </button>
  {/if}
</Interface>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
  }
</style>
