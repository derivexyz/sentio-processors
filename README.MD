### New Integrations
1. Copy paste existing integration
2. cd into new project
3. rename project name in `package.json` and `sentio.yaml`
4. delete all `node_modules, package-lock.json, yarn.lock, dist`
5. Run `yarn install` in ROOT directory (see Using derive-sentio-utils if reusing helper repo)
6. `yarn sentio build` and `yarn sentio gen`
7. modify `config.ts, processor.js, /utils`


### Uploading to sentio
- `npx @sentio/cli login --api-key <api-key>` (create API key in sentio dashboard)
- `cd <integrator package>`
- `yarn sentio upload --owner derive`

## Modifying derive-sentio-utils

1. Always run `yarn build` inside of `derive-sentio-utils` once done with change
2. reference the repo in your project's `package.json` (see other packages for examples)
3. Run `yarn build` in the root repo


If adding new graphQL schemas into `derive-sentio-utils`, make sure to export in `index.ts` and re-run BOTH `yarn sentio build` then `yarn build` (order matters).

### Getting v2 assetAndSubId
Use `chisel` in terminal
Run `bytes32(uint(uint160(<V2_ASSET_ADDRESS>)) << 96) | bytes32(<SUB_ID>)` 