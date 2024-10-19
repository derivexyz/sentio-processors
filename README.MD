### New Integrations


1. Copy paste existing integration
2. cd into new vault
3. rename project name in `package.json` and `sentio.yaml`
4. delete all `node_modules, package-lock.json, yarn.lock`
5. `yarn install`
6. `yarn sentio build` and `yarn sentio gen`
7. modify `config.ts`


### Uploading to sentio
- `npx @sentio/cli login --api-key <api-key>` (create API key in sentio dashboard)
- `yarn sentio upload --owner derive`

### Getting v2 assetAndSubId
Use `chisel` in terminal
Run `bytes32(uint(uint160(<V2_ASSET_ADDRESS>)) << 96) | bytes32(<SUB_ID>)` 

## Using derive-sentio-utils
1. `yarn build` and `yarn link` inside of `derive-sentio-utils`
2. `rm -rf node_modules` and `yarn cache clean` and `yarn link @derivefinance/derive-sentio-utils` and `yarn install` in subrepo that uses utils

If adding new graphQL schemas, make sure to export in `index.ts` and re-run BOTH `yarn sentio build` then `yarn build` (order matters).