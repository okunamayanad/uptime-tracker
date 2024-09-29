import config from "./config.ts";

interface NodeStatus {
  timeouts: number;
  online: boolean;
}

const nodeStatus: Record<string, NodeStatus> = {};

for (const node of config.nodes) {
  nodeStatus[node.name] = { timeouts: 0, online: true };
}

setInterval(async () => {
  for (const node of config.nodes) {
    if (node.name === config.whoami) {
      continue;
    }

    console.log(`Pinging ${node.name} on port ${node.port}`);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.error(`Request to ${node.name} timed out`);
        controller.abort();
      }, config.timeout);

      try {
        await fetch(`http://${node.ip}:${node.port}`, {
          signal: controller.signal,
        });
        console.log(`Successfully pinged ${node.name}`);
        nodeStatus[node.name].timeouts = 0; // Reset timeout counter on success
        nodeStatus[node.name].online = true; // Mark node as online on success
      } finally {
        clearTimeout(timeoutId);
      }
    } catch (e) {
      console.error(`Failed to ping ${node.name}`);
      nodeStatus[node.name].timeouts += 1;

      if (nodeStatus[node.name].timeouts >= 5) {
        nodeStatus[node.name].online = false;
        console.error(`Node ${node.name} marked as offline`);
      }
    }

    if (!nodeStatus[node.name].online) {
      console.log(`Node ${node.name} is currently offline`);
    }
  }
}, config.interval);

Bun.serve({
  port: config.nodes.find((node) => node.name === config.whoami)!.port,
  fetch(req, server) {
    const ip = server.requestIP(req)?.address;

    if (!config.nodes.find((node) => node.ip === ip))
      return new Response("Unauthorized", { status: 401 });

    return new Response("still online");
  },
});

console.log(
  `Serving on port ${
    config.nodes.find((node) => node.name === config.whoami)!.port
  }`
);
