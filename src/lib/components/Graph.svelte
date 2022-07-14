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

  const startNode = networkGraph.nodes.find(
    (element) => element.id === "6e968a25-76b3-4093-9352-de4f3566116d"
  ) as NodeElement;
  const middleNode = networkGraph.nodes.find(
    (element) => element.id === "1d4137b8-74cb-4d89-8905-59959cbb53d1"
  ) as NodeElement;
  const endNode = networkGraph.nodes.find(
    (element) => element.id === "5a176ab9-3ba6-4136-b769-a1e472040794"
  ) as NodeElement;

  const dfs = new DFS();
  let actionIndex = 0;
  const actions = dfs.start([startNode, middleNode, endNode], {
    nodes: networkGraph.nodes,
    edges: networkGraph.edges,
  });

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

  const start = () => {
    clearInterval(interval);
    interval = setInterval(() => {
      for (let i = 0; i < 5; i++) {
        next();
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

<button on:click={previous}>Previous</button>

<button on:click={next}>Next</button>
<button on:click={start}>Start</button>
<button on:click={stop}>Stop</button>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
  }
</style>
