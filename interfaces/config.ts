import type INode from "./node";

export default interface IConfig {
  whoami: string;
  interval: number;
  timeout: number;
  offlineThreshold: number;
  nodes: INode[];
  logFolder: string;
}
