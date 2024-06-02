# Build with `bun` 

```shell
bun build ./index.ts --compile --outfile stegpu
```

# Commands for stopping starting 

```shell
# Setup AWS profile
export AWS_PROFILE=stegpu 

# Start instance
bun run index.ts start i-086dcdf6680133b43

# Start instance
bun run index.ts stop i-086dcdf6680133b43

# Restart instance
bun run index.ts restart i-086dcdf6680133b43
```
