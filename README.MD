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
- `yarn sentio upload`

### Getting v2 assetAndSubId
Go to v2-subgraph, SQL query all assets and find asset_id for given asset using `SQL Editor`


Does not work (but should fix)
Use `chisel` in terminal
Run `bytes32(uint(uint160(<V2_ASSET_ADDRESS>)) << 96) | bytes32(<SUB_ID>)` 

