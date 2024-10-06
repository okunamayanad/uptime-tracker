// RENAME THIS FILE TO config.ts

import type IConfig from "./interfaces/config";

let config: IConfig = {
  whoami: "node1", // name of the node
  interval: 1000, // interval in ms
  timeout: 5000, // timeout in ms
  offlineThreshold: 5, // threshold for a node to be considered offline (per interval)
  nodes: [
    // list of nodes
    {
      name: "node1",
      ip: "1.1.1.1",
      port: 37214,
    },
    {
      name: "node2",
      ip: "2.2.2.2",
      port: 37214,
    },
  ],
  logFolder: "logs",
};

export default config;
