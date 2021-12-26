### [4.0.0](https://github.com/juliancwirko/elven-mint/releases/tag/v4.0.0) (2021-12-26)
- there is no more list of metadata CIDs needed - this change is because of the nft-art-maker changes. From now on, we will use only base CID for all image files and the metadata.json. Please see nft-art-maker changelog.

### [3.0.0](https://github.com/juliancwirko/elven-mint/releases/tag/v3.0.0) (2021-12-10)
- pass royalties as BigUint
- pass option to auto claim minted tokens (it requires proper smart contract)
- when there is no ipfs cid usage, the metadata will be hardcoded on-chain, it will also be encoded using base64
- adjusted to work with the example smart contract

### [2.0.0](https://github.com/juliancwirko/elven-mint/releases/tag/v2.0.0) (2021-11-19)
- changes to align it to the new nft-art-maker v3
- breaking changes in the configuration structure

### [1.1.0](https://github.com/juliancwirko/elven-mint/releases/tag/v1.1.0) (2021-11-01)
- added process state catch after exit - standard or unexpected

### [1.0.0](https://github.com/juliancwirko/elven-mint/releases/tag/v1.0.0) (2021-10-31)
- initial code
