<script lang="ts">
  import P5 from "p5-svelte";
  import DFS from "../functions/algorithm/types/DFS";
  import { downloadJson } from "../functions/utility";
  import _graph from "../data/graph.json";
  import NetworkGraphCanvas from "../functions/NetworkGraphCanvas";
  import type NodeElement from "../functions/elements/Node/NodeElement";
  let width = 900;
  let height = 600;

  const networkGraph = NetworkGraphCanvas.fromJSON(_graph, {
    width,
    height,
  });

  const start = networkGraph.nodes.find(
    (element) => element.id === "6e968a25-76b3-4093-9352-de4f3566116d"
  ) as NodeElement;
  const end = networkGraph.nodes.find(
    (element) => element.id === "9e21d77b-3bc0-4575-b7ca-0d42c099aa4b"
  ) as NodeElement;

  const dfs = new DFS();
  const events = dfs
    .start(start, end, {
      nodes: networkGraph.nodes,
      edges: networkGraph.edges,
    })
    .reverse();
</script>

<P5 sketch={networkGraph.setup} />

<button on:click={() => downloadJson(networkGraph.toJSON())}>
  Download Graph
</button>

<!-- <button on:click={() => gen.next()}>Next</button> -->
<button
  on:click={() => {
    setInterval(() => {
      const event = events.pop();
      if (event) {
        event();
      }
    }, 20);
  }}>Start</button
>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
  }
</style>
