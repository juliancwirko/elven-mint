### Elven Mint

NFT minting on the Elrond blockchain using [erdjs](https://github.com/ElrondNetwork/elrond-sdk-erdjs) SDK. It requires deployed smart contract which implements `esdt_nft_create`.

**Please always check and try to understand the code and possible limitations and bugs before using it for actual products**

The script relays on [nft-art-maker](https://github.com/juliancwirko/nft-art-maker) output metadata.json file. Check out the repo, and you'll find more info about it.

#### How it works

First of all elven-mint script assumes that you have deployed a smart contract which implements the `esdt_nft_create`. It also requires that you have your ESDT token, which it will use for NFT minting. It should also have proper roles assigned. You'll be able to configure all in the config file.

Good examples are in the Elrond GitHub repositories if you don't know how to prepare such a smart contract. I'll try to push some examples soon too.

You would also need to have a couple of files to be able to start:

1. Wallet keystore JSON file. The one you'll get when creating a [web wallet](https://devnet-wallet.elrond.com) - it would be best to create a new one for the Smart Contract. But you can always recover and download the JSON file using [https://devnet-wallet.elrond.com/recover](https://devnet-wallet.elrond.com/recover) and your seed phrases. (There is no support for the PEM files here, but I plan to add it).
2. You would also need to have the `metadata.json` generated using mentioned above [nft-art-maker](https://github.com/juliancwirko/nft-art-maker).
3. Finally, you would need a config file `.elvenmintrc` where you would need to provide a couple of crucial information. Below you'll find an example.

**Important! Keep the files private, especially password and keystore wallet file. To avoid any mistakes, you would need to write a wallet password with every script usage.**

So your directory should look similar to this:
```
metadata.json
wallet.json
.elvenmintrc
```

In this place, you will call the `npx elven-mint` command. Or you can also install it globally `npm install -g elven-mint` and then call `elven-mint`.

#### Configuration example

.elvenmintrc file with examples:
```
{
  "smartContractAddress": "erd1qqqqqqqqqqqqqpgqqfxkus66fkjpjuxlqnhzqwk5ru9h5smwvafsy9p3g0",
  "collectionTokenId": "ELO-5f0be3",
  "initialPriceOfNFT": "100000000000000000",
  "royaltiesCut": 1,
  "currentChain": "devnet",
  "walletFileName": "wallet.json",
  "createNftFunctionName": "createNft",
  "metadataFileName": "metadata.json"
}
```

- `smartContractAddress` - Smart Contract which mints NFTs [default: undefined]
- `collectionTokenId` - Your created ESDT token for NFT collection - should also have all required roles [default: undefined]
- `initialPriceOfNFT` - Price after mint (1 egld has 18 zeros) [default: undefined]
- `royaltiesCut` - royalties cut (format is a numeric value between 0 an 10000 (0 meaning 0% and 10000 meaning 100%) [default: 0]
- `currentChain` - Chain to be used (local, devnet, testnet, mainnet) [default: devnet]
- `walletFileName` - Your wallet json file name [default: wallet.json]
- `createNftFunctionName` - Create NFT function name in your smart contract [default: createNft]
- `metadataFileName` - Your metadata.json file name (generated by nft-art-maker) [default: metadata.json]

#### Handling unexpected termination of the minting process

It is crucial to be able to resume minting from the place where the process ended. It isn't possible yet. But there is a manual way of doing that. There is a helper which will console log the last sent transaction on every exit, and it looks like: 

```
elven-mint finished!
Last sent transaction:  {
  no: 2,
  name: '#2',
  txHash: '640232838d50e02102e279ec71b892e9d12aaddc85476a094001af38942fb628'
}
```

With this info, you can double-check all in the blockchain explorer, and you can modify your metadata.json file accordingly. So, for example, you can remove all first editions for which transactions are already on-chain and then restart the script. 

I plan to implement a resume script, but this isn't so crucial for now.

#### Updates

You can always install it globally if you are not sure which version you use. Do: `npm install elven-mint -g`

You can always check which version you have by: `elven-mint -v`

#### Contact me

- [https://twitter.com/JulianCwirko](https://twitter.com/JulianCwirko)
