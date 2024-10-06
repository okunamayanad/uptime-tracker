# uptime-tracker

## What is uptime-tracker?

uptime-tracker is a dead simple tool to track the uptime of a network of nodes. It is designed to be run on multiple nodes and will log the uptime of each node in the network. The logs are stored in a simple text file for easy access.

## How does it work?

TCP sockets are used to communicate between nodes. Each node will send a message to every other node in the network. If a node does not receive a message from another node within a set time, it will increment a timeout counter. If the timeout counter reaches a set limit, the node will be considered down and the uptime will be logged.

## How to use?

### Configuration

Copy the `config.example.ts` file to `config.ts` and modify the configuration as needed.

### Running

To run the program you can download the release from the releases page or build it yourself.

**TODO:** The releases also contain a LXC template and a Dockerfile to run the program in a container.

## Building and running

To build the program you will need to have [Node](https://nodejs.org/) and [Bun](https://bun.sh/) installed.

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

# About logs

## Log format:

### Name of log file:

`<YYYY-MM-DD>-<NODE_NAME>.log`

### Log format:

`---` means restart logging

after restart, the first line is information about current configuration

`<version>|<ISO8601>|<current node name>|` and then every nodes information in this format: `<node name>:<node ip>: <node port>` with nodes seperated by `!`

after initialisation, every line is in this format:

`<ISO8601>|<node name>|<number of timeouts>`

the current log version is `0.0.1`

### Older versions:

none for now
