# uptime-tracker

## What is uptime-tracker?

uptime-tracker is a dead simple tool to track the uptime of a network of nodes. It is designed to be run on multiple nodes and will log the uptime of each node in the network. The logs are stored in a simple text file for easy access.

## How does it work?

TCP sockets are used to communicate between nodes. Each node will send a message to every other node in the network. If a node does not receive a message from another node within a set time, it will increment a timeout counter. If the timeout counter reaches a set limit, the node will be considered down and the uptime will be logged.

## How to use?

### Configuration

Copy the `config.example.ts` file to `config.ts` and modify the configuration as needed.

### Running

To run the program you (**TODO:**) [can download the release from the releases page or build it yourself.](https://github.com/okunamayanad/uptime-tracker/issues/5)

**TODO:** [The releases also contain a LXC template and a Dockerfile to run the program in a container.](https://github.com/okunamayanad/uptime-tracker/issues/5)

### Viewing logs

The logs are stored in the `logs` directory. Each log file is named `<YYYY-MM-DD>-<NODE_NAME>.log`. The logs are in a simple text format and can be viewed with any text editor.

**TODO:** [You can also use uptime-viewer to view the logs.](https://github.com/users/okunamayanad/projects/6/views/3?pane=issue&itemId=82487574)

## Development and running

To build the program you will need to have [Node](https://nodejs.org/) and [Bun](https://bun.sh/) installed.

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

You can also use `--watch` to automatically restart the program when a file changes:

```bash
bun run --watch index.ts
```

# About logs

## Log format:

### Name of log file:

`<YYYY-MM-DD>-<NODE_NAME>.log`

### Log format:

`<>` means a variable in the config and `|` is a seperator **not** OR

`---` means restart logging

after restart, the first line is information about current configuration

`<version>|<ISO8601>|<offlineThreshold>|<current node name>|` and then every node in the network in the format `<node name>:<node ip>: <node port>` with nodes seperated by `!`

after initialization, a new line is added when a node changes state

`<ISO8601>|<node name>|<timeouts>` where `<timeouts>` is the number of timeouts the node has had (ranging from 0 to `<offlineThreshold>`)

the current log version is `0.0.3`

### Older versions:

[`0.0.2`](https://github.com/okunamayanad/uptime-tracker/blob/0f704bf4ddece3952a1084d3bafa2834b1ddda8f/README.md)
[`0.0.1`](https://github.com/okunamayanad/uptime-tracker/blob/614269a4c60c47d7c52a686c05f806507c5e91af/README.md)
