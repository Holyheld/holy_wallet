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

export const holySavingsWithdrawEstimation = async inputAmount => {
  logger.sentry('[holy savings withdraw estimation] estimation');

  const { accountAddress, network } = store.getState().settings;

  const contractAddress = HOLY_PASSAGE_ADDRESS(network);
  const contractABI = HOLY_PASSAGE_ABI;

  logger.sentry(
    '[holy savings withdraw estimation] for address:',
    accountAddress
  );

  // TODO: change to withdraw function
  const holyPassage = new Contract(contractAddress, contractABI, web3Provider);

  try {
    logger.sentry('holy savings withdraw estimation');
    const gasLimit = await holyPassage.estimateGas.migrate(inputAmount, {
      from: accountAddress,
    });
    logger.sentry('holy_savings_withdraw estimate: ' + gasLimit.toString());
    return gasLimit
      ? gasLimit.toString()
      : ethUnits.basic_holy_savings_withdraw;
  } catch (error) {
    logger.sentry('error holy_savings_withdraw estimate');
    logger.sentry(error);
    captureException(error);
    return ethUnits.basic_holy_savings_withdraw;
  }
};

export const holySavingsWithdraw = async (
  wallet,
  currentRap,
  index,
  parameters
) => {
  logger.log('[holy savings withdraw] start holy withdraw!');
  const {
    accountAddress,
    network,
    inputAmount,
    inputCurrency,
    selectedGasPrice,
  } = parameters;
  const { dispatch } = store;

  let gasPrice = get(selectedGasPrice, 'value.amount');
  const gasLimit = await holySavingsWithdrawEstimation();

  const contractAddress = HOLY_PASSAGE_ADDRESS(network);
  const contractABI = HOLY_PASSAGE_ABI;

  let migration;

  const walletToUse = wallet || (await loadWallet());
  if (!walletToUse) return null;

  try {
    logger.sentry('[holy savings withdraw] executing holy migration', {
      gasLimit,
      gasPrice,
    });

    const holyPassage = new Contract(contractAddress, contractABI, walletToUse);

    const transactionParams = {
      gasLimit: toHex(gasLimit) || undefined,
      gasPrice: toHex(gasPrice) || undefined,
    };

    migration = await holyPassage.migrate(transactionParams);
  } catch (e) {
    logger.sentry('[holy savings withdraw] error executing holy withdraw');
    captureException(e);
    throw e;
  }

  logger.log('[holy savings withdraw] response', migration);
  currentRap.actions[index].transaction.hash = migration.hash;
  dispatch(rapsAddOrUpdate(currentRap.id, currentRap));
  logger.log('[holy savings withdraw] adding a new holy txn', migration.hash);
  const newTransaction = {
    amount: inputAmount,
    asset: inputCurrency,
    from: accountAddress,
    hash: migration.hash,
    nonce: get(migration, 'nonce'),
    protocol: ProtocolTypes.holy.name,
    status: TransactionStatusTypes.withdrawing,
    to: get(migration, 'to'),
    type: TransactionTypes.trade,
  };
  logger.log('[holy savings withdraw] adding new txn', newTransaction);
  await dispatch(dataAddNewTransaction(newTransaction, accountAddress, true));
  logger.log('[holy savings withdraw] calling the callback');
  currentRap.callback();
  currentRap.callback = NOOP;
  try {
    logger.log(
      '[holy savings withdraw] waiting for the holy migration to go thru'
    );
    const receipt = await walletToUse.provider.waitForTransaction(
      migration.hash
    );
    logger.log('[holy savings withdraw] receipt:', receipt);
    if (!isZero(receipt.status)) {
      currentRap.actions[index].transaction.confirmed = true;
      dispatch(rapsAddOrUpdate(currentRap.id, currentRap));
      logger.log('[holy savings withdraw] updated raps');
      return;
    } else {
      logger.log('[holy savings withdraw] status not success');
      currentRap.actions[index].transaction.confirmed = false;
      dispatch(rapsAddOrUpdate(currentRap.id, currentRap));
      return null;
    }
  } catch (error) {
    logger.log('[holy savings withdraw] error waiting for holy migrate', error);
    currentRap.actions[index].transaction.confirmed = false;
    dispatch(rapsAddOrUpdate(currentRap.id, currentRap));
    return null;
  }
};
