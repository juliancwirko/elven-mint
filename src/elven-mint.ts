import { exit } from 'process';
import * as config from './config';

import {
  syncProviderConfig,
  prepareUserAccount,
  prepareUserSigner,
  getWalletFile,
  getSmartContract,
  getProvider,
  makeTransactions,
  getWalletPassword,
} from './utils';

// Main function
export const mint = async () => {
  try {
    // Prompt configuration for the password
    const password = await getWalletPassword();

    // JSON wallet file
    const wallet = getWalletFile();

    // Smart contract instance - SC responsible of minting
    const smartContract = getSmartContract();

    // Provider type based on initial configuration
    const provider = getProvider();
    await syncProviderConfig(provider);

    const userAccount = await prepareUserAccount(wallet.bech32);
    await userAccount.sync(provider);

    const signer = prepareUserSigner(wallet, password as string);

    if (
      config.collectionTokenId &&
      config.createNftFunctionName &&
      config.initialPriceOfNFT
    ) {
      await makeTransactions(
        userAccount,
        provider,
        signer,
        smartContract,
        config.createNftFunctionName,
        config.collectionTokenId
      );
    } else {
      console.log(
        'Please check if you configured your collectionTokenId, createNftFunctionName and initialPriceOfNFT'
      );
      exit();
    }
  } catch (e: any) {
    console.log('Oops, something went wrong: ', e.message);
  }
};
