import { isIPInRangeOrPrivate } from "range_check";
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

    const controller = new AbortController();
    const nodeTimeoutTimer = setTimeout(() => {
      // Timeout logic
      console.error(`Request to ${node.name} timed out`);
      controller.abort();

      nodeStatus[node.name].timeouts += 1;

      if (nodeStatus[node.name].timeouts >= 5) {
        nodeStatus[node.name].online = false;
        console.error(`Node ${node.name} marked as offline`);

        console.log("Nodes status:");
        console.table(nodeStatus);
      }
    }, config.timeout);

    try {
      await fetch(`http://${node.ip}:${node.port}`, {
        signal: controller.signal,
      });
      console.log(`Successfully pinged ${node.name}`);
      if (!nodeStatus[node.name].online) {
        console.log(`Node ${node.name} marked as online`);
      }
      nodeStatus[node.name].timeouts = 0;
      nodeStatus[node.name].online = true;
    } catch (err: any) {
      if (err.name === "AbortError") {
        continue;
      }

      console.error(`Error pinging ${node.name}: ${err}`);
    } finally {
      clearTimeout(nodeTimeoutTimer);
    }
  }
}, config.interval);

Bun.serve({
  port: config.nodes.find((node) => node.name === config.whoami)!.port,
  fetch(req, server) {
    const ip = server.requestIP(req)?.address;

    if (!ip) throw new Error("IP address cannot be determined");

    if (isIPInRangeOrPrivate(ip)) return new Response("hello world");

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
