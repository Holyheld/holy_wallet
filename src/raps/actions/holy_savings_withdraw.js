import { Contract } from '@ethersproject/contracts';
import { captureException } from '@sentry/react-native';
import { get } from 'lodash';
import { toHex, web3Provider } from '../../handlers/web3';
import ProtocolTypes from '../../helpers/protocolTypes';
import TransactionStatusTypes from '../../helpers/transactionStatusTypes';
import TransactionTypes from '../../helpers/transactionTypes';
import { convertAmountToRawAmount, isZero } from '../../helpers/utilities';
import { loadWallet } from '../../model/wallet';
import { dataAddNewTransaction } from '../../redux/data';
import { rapsAddOrUpdate } from '../../redux/raps';
import store from '../../redux/store';
import { ethUnits } from '../../references';
import {
  HOLY_HAND_ABI,
  HOLY_HAND_ADDRESS,
  HOLY_SAVINGS_POOL_ADDRESS,
} from '../../references/holy';
import logger from 'logger';

const NOOP = () => undefined;

export const holySavingsWithdrawEstimation = async ({
  inputAmount,
  inputCurrency,
}) => {
  logger.log('[holy savings withdraw estimation] estimation for');
  logger.log('input amount: ', inputAmount);
  logger.log('input currency: ', inputCurrency);

  if (!inputAmount) {
    logger.log(
      'Empty input amount, estimate as basic value: ' +
        ethUnits.basic_holy_savings_withdraw
    );

    return ethUnits.basic_holy_savings_withdraw;
  }

  const { accountAddress, network } = store.getState().settings;

  const poolAddress = HOLY_SAVINGS_POOL_ADDRESS(network);

  const contractAddress = HOLY_HAND_ADDRESS(network);
  const contractABI = HOLY_HAND_ABI;

  logger.log('[holy savings withdraw estimation] for address:', accountAddress);

  const holyHand = new Contract(contractAddress, contractABI, web3Provider);

  try {
    logger.log('holy savings withdraw estimation');

    const inputAmountInWEI = convertAmountToRawAmount(
      inputAmount,
      inputCurrency.decimals
    );

    const gasLimit = await holyHand.estimateGas.withdrawFromPool(
      poolAddress,
      inputAmountInWEI,
      {
        from: accountAddress,
      }
    );
    logger.log('holy_savings_withdraw estimate: ' + gasLimit.toString());
    return gasLimit
      ? gasLimit.toString()
      : ethUnits.basic_holy_savings_withdraw;
  } catch (error) {
    logger.log('error holy_savings_withdraw estimate');
    logger.log(error);
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
  const gasLimit = await holySavingsWithdrawEstimation({
    inputAmount,
    inputCurrency,
  });

  const poolAddress = HOLY_SAVINGS_POOL_ADDRESS(network);

  const contractAddress = HOLY_HAND_ADDRESS(network);
  const contractABI = HOLY_HAND_ABI;

  let withdraw;

  const walletToUse = wallet || (await loadWallet());
  if (!walletToUse) return null;

  const transactionParams = {
    from: accountAddress,
    gasLimit: toHex(gasLimit) || undefined,
    gasPrice: toHex(gasPrice) || undefined,
  };

  try {
    logger.log('[holy savings withdraw] executing holy withdraw', {
      gasLimit,
      gasPrice,
    });

    const holyHand = new Contract(contractAddress, contractABI, walletToUse);

    const inputAmountInWEI = convertAmountToRawAmount(
      inputAmount,
      inputCurrency.decimals
    );

    withdraw = await holyHand.withdrawFromPool(
      poolAddress,
      inputAmountInWEI,
      transactionParams
    );
  } catch (e) {
    logger.log('[holy savings withdraw] error executing holy withdraw');
    logger.log('error:', e);
    captureException(e);
    throw e;
  }

  logger.log('[holy savings withdraw] response', withdraw);
  currentRap.actions[index].transaction.hash = withdraw.hash;
  dispatch(rapsAddOrUpdate(currentRap.id, currentRap));
  logger.log('[holy savings withdraw] adding a new holy txn', withdraw.hash);
  const newTransaction = {
    amount: inputAmount,
    asset: inputCurrency,
    from: accountAddress,
    gasLimit: transactionParams.gasLimit,
    gasPrice: transactionParams.gasPrice,
    hash: withdraw.hash,
    nonce: get(withdraw, 'nonce'),
    protocol: ProtocolTypes.holy.name,
    status: TransactionStatusTypes.withdrawing,
    to: get(withdraw, 'to'),
    type: TransactionTypes.withdraw,
  };
  logger.log('[holy savings withdraw] adding new txn', newTransaction);
  await dispatch(dataAddNewTransaction(newTransaction, accountAddress, true));
  logger.log('[holy savings withdraw] calling the callback');
  currentRap.callback();
  currentRap.callback = NOOP;
  try {
    logger.log(
      '[holy savings withdraw] waiting for the holy withdraw to go thru'
    );
    const receipt = await walletToUse.provider.waitForTransaction(
      withdraw.hash
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
    logger.log(
      '[holy savings withdraw] error waiting for holy withdraw',
      error
    );
    currentRap.actions[index].transaction.confirmed = false;
    dispatch(rapsAddOrUpdate(currentRap.id, currentRap));
    return null;
  }
};
