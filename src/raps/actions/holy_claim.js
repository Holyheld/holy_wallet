import { Contract } from '@ethersproject/contracts';
import { captureException } from '@sentry/react-native';
import { get } from 'lodash';
import { toHex, web3Provider } from '../../handlers/web3';
import ProtocolTypes from '../../helpers/protocolTypes';
import TransactionStatusTypes from '../../helpers/transactionStatusTypes';
import TransactionTypes from '../../helpers/transactionTypes';
import { isZero } from '../../helpers/utilities';
import { loadWallet } from '../../model/wallet';
import { dataAddNewTransaction } from '../../redux/data';
import { rapsAddOrUpdate } from '../../redux/raps';
import store from '../../redux/store';
import { ethUnits } from '../../references';
import { HOLY_PASSAGE_ABI, HOLY_PASSAGE_ADDRESS } from '../../references/holy';
import logger from 'logger';

const NOOP = () => undefined;

export const holyClaimEstimation = async () => {
  logger.sentry('[holy claim estimation] executing holy claim estimation');

  const { accountAddress, network } = store.getState().settings;
  const contractAddress = HOLY_PASSAGE_ADDRESS(network);
  const contractABI = HOLY_PASSAGE_ABI;

  logger.sentry('[holy claim estimation] for address:', accountAddress);

  const holyPassage = new Contract(contractAddress, contractABI, web3Provider);

  try {
    logger.sentry('holy_claim estimate');
    const gasLimit = await holyPassage.estimateGas.claimBonus({
      from: accountAddress,
    });
    const gasLimitString = gasLimit.toString();
    logger.sentry('holy_claim estimate: ' + gasLimitString);
    return gasLimit ? gasLimitString : ethUnits.basic_holy_claim;
  } catch (error) {
    logger.sentry('error holy_claim estimate');
    logger.sentry(error);
    captureException(error);
    return ethUnits.basic_holy_claim;
  }
};

const holyClaim = async (wallet, currentRap, index, parameters) => {
  logger.log('[holy claim] start holy claim!');
  const {
    accountAddress,
    amount,
    inputCurrency,
    network,
    selectedGasPrice,
  } = parameters;
  const { dispatch } = store;
  const contractAddress = HOLY_PASSAGE_ADDRESS(network);
  const contractABI = HOLY_PASSAGE_ABI;

  let gasPrice = get(selectedGasPrice, 'value.amount');
  const gasLimit = await holyClaimEstimation();

  let claiming;

  const walletToUse = wallet || (await loadWallet());
  if (!walletToUse) return null;

  const transactionParams = {
    gasLimit: toHex(gasLimit) || undefined,
    gasPrice: toHex(gasPrice) || undefined,
  };

  try {
    logger.sentry('[holy claim] executing holy claim', {
      gasLimit,
      gasPrice,
    });

    const holyPassage = new Contract(contractAddress, contractABI, walletToUse);

    claiming = await holyPassage.claimBonus(transactionParams);
  } catch (e) {
    logger.sentry('[holy claim] error executing holy claim');
    logger.sentry(e);
    captureException(e);
    throw e;
  }

  logger.log('[holy claim] response', claiming);
  currentRap.actions[index].transaction.hash = claiming.hash;
  dispatch(rapsAddOrUpdate(currentRap.id, currentRap));
  logger.log('[holy claim] adding a new holy claim txn', claiming.hash);
  const newTransaction = {
    amount: amount,
    asset: inputCurrency,
    from: accountAddress,
    gasLimit: transactionParams.gasLimit,
    gasPrice: transactionParams.gasPrice,
    hash: claiming.hash,
    nonce: get(claiming, 'nonce'),
    protocol: ProtocolTypes.holy.name,
    status: TransactionStatusTypes.claiming,
    to: get(claiming, 'to'),
    type: TransactionTypes.claim,
  };
  logger.log('[holy claim] adding new txn', newTransaction);
  await dispatch(dataAddNewTransaction(newTransaction, accountAddress));
  logger.log('[holy claim] calling the callback');
  currentRap.callback();
  currentRap.callback = NOOP;
  try {
    logger.log('[holy claim] waiting for the holy claiming to go thru');
    const receipt = await walletToUse.provider.waitForTransaction(
      claiming.hash
    );
    logger.log('[holy claim] receipt:', receipt);
    if (!isZero(receipt.status)) {
      currentRap.actions[index].transaction.confirmed = true;
      dispatch(rapsAddOrUpdate(currentRap.id, currentRap));
      logger.log('[holy claim] updated raps');
      return;
    } else {
      logger.log('[holy claim] status not success');
      currentRap.actions[index].transaction.confirmed = false;
      dispatch(rapsAddOrUpdate(currentRap.id, currentRap));
      return null;
    }
  } catch (error) {
    logger.log('[holy claim] error waiting for holy claim', error);
    currentRap.actions[index].transaction.confirmed = false;
    dispatch(rapsAddOrUpdate(currentRap.id, currentRap));
    return null;
  }
};

export default holyClaim;
