### New Integrations
1. Copy paste existing integration
2. cd into new project
3. rename project name in `package.json` and `sentio.yaml`
4. delete all `node_modules, package-lock.json, yarn.lock, dist`
5. `yarn install` (see Using derive-sentio-utils if reusing helper repo)
6. `yarn sentio build` and `yarn sentio gen`
7. modify `config.ts, /utils`


### Uploading to sentio
- `npx @sentio/cli login --api-key <api-key>` (create API key in sentio dashboard)
- `yarn sentio upload --owner derive`

## Using derive-sentio-utils
1. `yarn build` inside of `derive-sentio-utils`
2. reference the repo in your project's `package.json` (see other packages for examples)
3. run `yarn install` and `yarn sentio build` in your project


If adding new graphQL schemas into `derive-sentio-utils`, make sure to export in `index.ts` and re-run BOTH `yarn sentio build` then `yarn build` (order matters).

### Getting v2 assetAndSubId
Use `chisel` in terminal
Run `bytes32(uint(uint160(<V2_ASSET_ADDRESS>)) << 96) | bytes32(<SUB_ID>)` 