import { readFileSync, accessSync, constants } from 'fs';
import { exit, cwd } from 'process';

import {
  NetworkConfig,
  chooseProvider,
  UserSigner,
  Account,
  Address,
  IProvider,
  SmartContract,
  ContractFunction,
  GasLimit,
  BytesValue,
  U32Value,
  BigUIntValue,
  ISigner,
  SystemConstants,
} from '@elrondnetwork/erdjs';
import BigNumber from 'bignumber.js';
import ora from 'ora';
import prompt from 'prompt';

import { ProcessState } from './catch-on-exit';
import * as config from './config';

export interface Metadata {
  name: string;
  description: string;
  properties: {
    edition: number;
    attributes: {
      trait_type: string;
      value: string;
    }[];
    base64SvgDataUri?: string;
    hash?: string;
    tags?: string;
  };
  image: {
    href: string;
    hash: string;
  };
}

export const baseDir = cwd();

export const getWalletPassword = async () => {
  const promptSchema = {
    properties: {
      password: {
        description: 'Wallet Keystore password',
        required: true,
        hidden: true,
        replace: '*',
      },
    },
  };

  prompt.start();

  try {
    const { password } = await prompt.get([promptSchema]);

    if (!password) {
      console.log('You have to provide wallet password!');
      exit();
    }

    return password;
  } catch (e: any) {
    console.log(e.message);
    exit();
  }
};

export const getSmartContract = () => {
  if (!config.smartContractAddress) {
    console.log(
      'Please provide your Smart Contract address in the configuration file!'
    );
    exit();
  } else {
    const contract = new SmartContract({
      address: new Address(config.smartContractAddress),
    });
    return contract;
  }
};

const fileTypeMap: Record<string, string> = {
  wallet: config.walletFileName,
  metadataSummary: config.metadataFileName,
  metadataCids: config.metadataCidsListFileName,
};

export const getFileContents = (
  type: 'wallet' | 'metadataSummary' | 'metadataCids',
  preventExit = false
) => {
  const filePath = `${baseDir}/${fileTypeMap[type]}`;

  try {
    accessSync(filePath, constants.R_OK | constants.W_OK);
  } catch (err) {
    if (preventExit) return null;
    console.error(`No access to the ${type} JSON file!`);
    exit();
  }

  const rawFile = readFileSync(filePath);
  return JSON.parse(rawFile.toString('utf8'));
};

export const getProvider = () => {
  return chooseProvider(config.providerIds[config.currentChain]);
};

// Sync proper chain, for example, the devnet
export const syncProviderConfig = async (provider: IProvider) => {
  return NetworkConfig.getDefault().sync(provider);
};

// Prepare user signer - we need to be able to sign transactions
// using JSON wallet file and password
// It can also be configured using a pem file, but for now, this will be enough
export const prepareUserSigner = (wallet: any, walletPassword: string) => {
  const signer = UserSigner.fromWallet(wallet, walletPassword);

  return signer;
};

// Prepare main user account from the address
export const prepareUserAccount = async (address: string) => {
  return new Account(new Address(address));
};

export const getProperMetadataCid = (
  metadataCidsList: { name: string; cid: string }[],
  editionNumber: number
) => {
  return metadataCidsList.find((item) =>
    item.name.includes(editionNumber.toString())
  )?.cid;
};

export const makeTransactions = async (
  userAccount: Account,
  provider: IProvider,
  signer: ISigner,
  smartContract: SmartContract,
  createNftFunctionName: string,
  collectionTokenId: string
) => {
  const metadata: { editions: Metadata[] } = getFileContents('metadataSummary');
  const metadataCidsList = getFileContents('metadataCids', true);

  const metadataString = (entry: Metadata) => {
    if (metadataCidsList) {
      return getProperMetadataCid(metadataCidsList, entry.properties.edition);
    }
    return JSON.stringify({
      description: entry.description,
      attributes: entry.properties.attributes,
      hash: entry.image.hash, // sha256 of the real image (png or svg)
    });
  };

  for (const [index, entry] of metadata.editions.entries()) {
    const token = BytesValue.fromUTF8(collectionTokenId);
    const name = BytesValue.fromUTF8(entry.name);
    const uri = BytesValue.fromUTF8(entry.image.href);
    const attributes = BytesValue.fromUTF8(
      `tags:${entry.properties.tags};metadata:${metadataString(entry)}`
    );
    // The best will be if your SC creates a hash from attributes
    // But anyway, the script will take it from JSON file if any
    const hash = BytesValue.fromUTF8(entry.properties.hash || '');

    const transaction = smartContract.call({
      func: new ContractFunction(createNftFunctionName),
      args: [
        token,
        name,
        uri,
        attributes,
        hash,
        new U32Value(config.royaltiesCut),
        new BigUIntValue(new BigNumber(config.initialPriceOfNFT)),
      ],
      gasLimit: new GasLimit(SystemConstants.MIN_TRANSACTION_GAS), // gas limit - initial value
    });

    // TODO: check if this can be calculated in a better way?
    const minTxGas = SystemConstants.MIN_TRANSACTION_GAS.valueOf();
    const esdtIssueGas = SystemConstants.ESDT_ISSUE_GAS_LIMIT.valueOf();
    const gasPerDataByte = NetworkConfig.getDefault().GasPerDataByte.valueOf();
    const gasLimit =
      esdtIssueGas +
      transaction.getData().length() * gasPerDataByte +
      token.getLength() * minTxGas +
      name.getLength() * minTxGas +
      uri.getLength() * minTxGas +
      attributes.getLength() * minTxGas +
      hash.getLength() * minTxGas;

    transaction.setGasLimit(new GasLimit(gasLimit));

    transaction.setNonce(userAccount.nonce);
    userAccount.incrementNonce();
    signer.sign(transaction);

    const spinner = ora('Processing transactions...');
    spinner.start();

    try {
      const txHash = await transaction.send(provider);
      ProcessState.set({
        no: index + 1,
        name: entry.name,
        txHash: txHash.toString(),
      });

      await transaction.awaitExecuted(provider);

      const txStatus = transaction.getStatus();

      spinner.stop();

      if (txStatus && txStatus.isInvalid()) {
        console.log(`Invalid! Tx ${index + 1}: `, txHash.toString());
        exit();
      }
      if (txStatus && txStatus.isSuccessful()) {
        console.log(`Success! Tx ${index + 1}: `, txHash.toString());
      }
      if (txStatus && txStatus.isFailed()) {
        console.log(`Failed! Tx ${index + 1}: `, txHash.toString());
        exit();
      }
    } catch (e) {
      console.log(e);
    }
  }
};
