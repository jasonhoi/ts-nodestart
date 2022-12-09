# Typescript node project

This project use Node.js v18+, using experimental json file import as ES module.

The sample code comes from Uniswap V3 [create a trade](https://docs.uniswap.org/sdk/v3/guides/creating-a-trade).

Please create your own free account at [Alchemy](https://www.alchemy.com/), insert the HTTPS RPC endpoint at `src/index.ts`, line `const provider = new ethers.providers.JsonRpcProvider({RPC_endpoint})`.

```bash

# make sure you installed Node.js v18+ (in order to support import json file as ES6 module)
node -v
# sample output: v18.12.1

# create your environment file and put in your RPC api url
cp .env-sample .env

# install tsc (typescript) as global npm module
npm install -g typescript

# install node modules
npm install

# build ts to js
npm run build

# build + run
npm run start

```
