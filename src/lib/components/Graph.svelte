<script lang="ts">
  import P5 from "p5-svelte";
  import DFS from "../functions/algorithm/types/DFS";
  import { delay, downloadJson } from "../functions/utility";
  import graphBig from "../data/graph.json";
  import graphSmall from "../data/graph_small.json";
  import NetworkGraphCanvas from "../functions/NetworkGraphCanvas";
  import type NodeElement from "../functions/elements/Node/NodeElement";
  import type { AlgorithmAction } from "../functions/algorithm/Algorithm";
  let width = 900;
  let height = 600;

  let graph = graphSmall;

  const networkGraph = NetworkGraphCanvas.fromJSON(graph, {
    width,
    height,
  });

  let startNode: NodeElement | undefined,
    middleNode: NodeElement | undefined,
    endNode: NodeElement | undefined;
  let dfs: DFS | undefined;

  let actionIndex = 0;
  // const actions = dfs.start([startNode, middleNode, endNode]);
  let actions: AlgorithmAction[] | undefined;

  let gen: IterableIterator<any> | undefined;

  $: {
    networkGraph.setGraph(graph);

    startNode = networkGraph.nodes.find(
      (element) => element.id === "6e968a25-76b3-4093-9352-de4f3566116d"
    ) as NodeElement;
    middleNode = networkGraph.nodes.find(
      (element) => element.id === "1d4137b8-74cb-4d89-8905-59959cbb53d1"
    ) as NodeElement;
    endNode = networkGraph.nodes.find(
      (element) => element.id === "5a176ab9-3ba6-4136-b769-a1e472040794"
    ) as NodeElement;

    dfs = new DFS({
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

  let yieldInterval = 5;

  const start = () => {
    clearInterval(interval);

    const started = new Date().getTime();
    let processed = 0;

    interval = setInterval(() => {
      const now = new Date().getTime();
      const expected = Math.floor((now - started) / yieldInterval);

      const need = expected - processed;

      for (let i = 0; i < need; i++) {
        // gen.next();
        next();
        processed++;
      }
    }, 5);
  };

  const stop = () => {
    clearInterval(interval);
  };
</script>

<P5 sketch={networkGraph.setup} />

<button on:click={() => downloadJson(networkGraph.toJSON())}>
  Download Graph
</button>

<button
  on:click={() => {
    graph = graphSmall;
  }}
>
  Load Small Graph
</button>

<button
  on:click={() => {
    graph = graphBig;
  }}
>
  Load Big Graph
</button>

{#if actions}
  <button on:click={previous}>Previous</button>

  <button on:click={next}>Next</button>
  <button on:click={start}>Start</button>
  <button on:click={stop}>Stop</button>
{:else}
  <button
    on:click={() => {
      actions = dfs.start([startNode, middleNode, endNode]);
      actionIndex = 0;
      // gen = dfs.startGenerator([startNode, middleNode, endNode]);
    }}
  >
    Load Algorithm
  </button>
{/if}

<style>
  :global(body) {
    margin: 0;
    padding: 0;
  }
</style>
