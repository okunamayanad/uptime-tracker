import { isIPInRangeOrPrivate } from "range_check";
import config from "./config.ts";
import fs from "fs";
import path from "path";
import pkg from "./package.json";

if (!fs.existsSync(path.resolve(__dirname, config.logFolder))) {
  fs.mkdirSync(path.resolve(__dirname, config.logFolder));
}

let calculateLogName = () => {
  return `${config.logFolder}/${new Date().toISOString().split("T")[0]}-${
    config.whoami
  }.log`;
};

let logStream = fs.createWriteStream(
  path.resolve(__dirname, calculateLogName()),
  {
    flags: "a", // 'a' means appending (old data will be preserved)
  }
);
initLogMessage(logStream);

function initLogMessage(logStream: fs.WriteStream) {
  let nodeInfo = config.nodes
    .map((node) => `${node.name}:${node.ip}:${node.port}`)
    .join("!");

  logStream.write(
    `---\n${pkg.logVersion}|${new Date().toISOString()}|${
      config.offlineThreshold
    }|${config.whoami}|${nodeInfo}\n`
  );
}

function writeNodeLog(
  logStream: fs.WriteStream,
  nodeName: string,
  timeouts: number
) {
  logStream.write(`${new Date().toISOString()}|${nodeName}|${timeouts}\n`);
}

function resetLogStream() {
  logStream.end();
  logStream = fs.createWriteStream(
    path.resolve(__dirname, calculateLogName()),
    {
      flags: "a", // 'a' means appending (old data will be preserved)
    }
  );
  initLogMessage(logStream);
}

interface NodeStatus {
  timeouts: number;
  online: boolean;
}

const nodeStatus: Record<string, NodeStatus> = {};

for (const node of config.nodes) {
  nodeStatus[node.name] = { timeouts: 0, online: true };
}

function handleTimeout(node: string) {
  nodeStatus[node].timeouts += 1;

  if (nodeStatus[node].timeouts >= config.offlineThreshold) {
    if (nodeStatus[node].online) {
      console.error(`Node ${node} marked as offline`);
      writeNodeLog(logStream, node, config.offlineThreshold);
    }
    nodeStatus[node].online = false;
    console.log("Nodes status:");
  } else {
    writeNodeLog(logStream, node, nodeStatus[node].timeouts);
  }
}

setInterval(async () => {
  for (const node of config.nodes) {
    if (node.name === config.whoami) {
      continue;
    }

    console.log(`Pinging ${node.name} on port ${node.port}`);

    const controller = new AbortController();
    const nodeTimeoutTimer = setTimeout(() => {
      console.error(`Request to ${node.name} timed out`);
      controller.abort();

      handleTimeout(node.name);
    }, config.timeout);

    try {
      await fetch(`http://${node.ip}:${node.port}`, {
        signal: controller.signal,
      });
      console.log(`Successfully pinged ${node.name}`);
      if (!nodeStatus[node.name].online) {
        console.log(`Node ${node.name} marked as online`);
      }
      if (nodeStatus[node.name].timeouts !== 0) {
        writeNodeLog(logStream, node.name, 0);
      }
      nodeStatus[node.name].timeouts = 0;
      nodeStatus[node.name].online = true;
    } catch (err: any) {
      if (err.name === "AbortError") {
        continue;
      }

      console.error(`Error pinging ${node.name}: ${err}`);

      handleTimeout(node.name);
    } finally {
      clearTimeout(nodeTimeoutTimer);
    }
  }

  console.table(nodeStatus);
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
