# uptime-tracker

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
