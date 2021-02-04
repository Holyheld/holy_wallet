import {
  arrayify,
  concat,
  hexlify,
  hexValue,
  hexZeroPad,
} from '@ethersproject/bytes';
import { Contract } from '@ethersproject/contracts';
import { captureException } from '@sentry/react-native';
import BigNumber from 'bignumber.js';
import { get } from 'lodash';
import { toHex, web3Provider } from '../../handlers/web3';
import ProtocolTypes from '../../helpers/protocolTypes';
import TransactionStatusTypes from '../../helpers/transactionStatusTypes';
import TransactionTypes from '../../helpers/transactionTypes';
import {
  convertAmountToRawAmount,
  convertStringToHexWithPrefix,
  isZero,
  multiply,
} from '../../helpers/utilities';
import { loadWallet } from '../../model/wallet';
import { dataAddNewTransaction } from '../../redux/data';
import { rapsAddOrUpdate } from '../../redux/raps';
import store from '../../redux/store';
import { ethUnits } from '../../references';
import { HOLY_HAND_ABI, HOLY_HAND_ADDRESS } from '../../references/holy';
import logger from 'logger';

const NOOP = () => undefined;

export const holySwapEstimation = async ({
  accountAddress,
  inputAmount,
  inputCurrency,
  network,
  outputCurrency,
  transferData,
}) => {
  logger.log('[holy swap estimation] estimation');

  if (!inputAmount || !transferData) {
    logger.log(
      '[holy swap estimation] input amount or transfer data is null - return basic value'
    );

    return ethUnits.basic_holy_savings_deposit;
  }

  const contractAddress = HOLY_HAND_ADDRESS(network);
  const contractABI = HOLY_HAND_ABI;

  try {
    const holyHand = new Contract(contractAddress, contractABI, web3Provider);

    const transactionParams = {
      from: accountAddress,
    };

    const inputAmountInWEI = convertAmountToRawAmount(
      inputAmount,
      inputCurrency.decimals
    );

    logger.log('[holy swap estimation] input amount in WEI:', inputAmountInWEI);

    let bytesData = [];
    let expectedMinimumReceived = '0';

    if (transferData) {
      expectedMinimumReceived = new BigNumber(
        multiply(transferData.buyAmount, '0.85')
      ).toFixed(0);

      logger.log(
        '[holy swap estimation] expected minimum received:',
        expectedMinimumReceived
      );

      const valueBytes = arrayify(
        hexZeroPad(convertStringToHexWithPrefix(transferData.value), 32)
      );
      logger.log('[holy swap estimation] valueBytes:', hexlify(valueBytes));

      bytesData = concat([
        arrayify(transferData.to),
        arrayify(transferData.allowanceTarget),
        valueBytes,
        arrayify(transferData.data),
      ]);

      logger.log('[holy swap estimation] bytesData:', hexlify(bytesData));
    }

    const gasLimit = await holyHand.estimateGas.executeSwap(
      inputCurrency.address,
      outputCurrency.address,
      inputAmountInWEI,
      expectedMinimumReceived,
      bytesData,
      transactionParams
    );

    const gasLimitString = gasLimit.toString();
    logger.log(
      '[holy swap estimation] gas estimation by ether.js: ' + gasLimitString
    );
    return gasLimit ? gasLimitString : ethUnits.basic_holy_swap;
  } catch (error) {
    logger.log('error holy swap estimate');
    logger.log(error);
    captureException(error);
    return ethUnits.basic_holy_swap;
  }
};

export const holySwap = async (wallet, currentRap, index, parameters) => {
  logger.log('[holy swap] start holy deposit!');
  const {
    accountAddress,
    network,
    inputAmount,
    inputCurrency,
    outputCurrency,
    selectedGasPrice,
    transferData,
  } = parameters;
  const { dispatch } = store;

  let gasPrice = get(selectedGasPrice, 'value.amount');
  const gasLimit = await holySwapEstimation({
    accountAddress,
    inputAmount,
    inputCurrency,
    network,
    outputCurrency,
    transferData,
  });

  const contractAddress = HOLY_HAND_ADDRESS(network);
  const contractABI = HOLY_HAND_ABI;

  let swap;

  const walletToUse = wallet || (await loadWallet());
  if (!walletToUse) return null;

  try {
    logger.log('[holy swap] gas Limit and price:', {
      gasLimit,
      gasPrice,
    });

    const holyHand = new Contract(contractAddress, contractABI, walletToUse);

    const transactionParams = {
      from: accountAddress,
      gasLimit: toHex(gasLimit) || undefined,
      gasPrice: toHex(gasPrice) || undefined,
    };

    const inputAmountInWEI = convertAmountToRawAmount(
      inputAmount,
      inputCurrency.decimals
    );

    logger.log('[holy swap] input amount in WEI:', inputAmountInWEI);

    let bytesData = [];
    let expectedMinimumReceived = '0';

    if (transferData) {
      expectedMinimumReceived = new BigNumber(
        multiply(transferData.buyAmount, '0.85')
      ).toFixed(0);

      logger.log(
        '[holy swap] expected minimum received:',
        expectedMinimumReceived
      );

      const valueBytes = arrayify(
        hexZeroPad(hexValue(+transferData.value), 32)
      );
      logger.log('[holy swap] valueBytes:', hexlify(valueBytes));

      bytesData = concat([
        arrayify(transferData.to),
        arrayify(transferData.allowanceTarget),
        valueBytes,
        arrayify(transferData.data),
      ]);

      logger.log('[holy swap] bytesData:', hexlify(bytesData));
    }

    swap = await holyHand.executeSwap(
      inputCurrency.address,
      outputCurrency.address,
      inputAmountInWEI,
      expectedMinimumReceived,
      bytesData,
      transactionParams
    );
  } catch (e) {
    logger.log('[holy swap] error executing holy swap', e);
    captureException(e);
    throw e;
  }

  logger.log('[holy swap] response', swap);
  currentRap.actions[index].transaction.hash = swap.hash;
  dispatch(rapsAddOrUpdate(currentRap.id, currentRap));
  logger.log('[holy swap] adding a new holy txn', swap.hash);
  const newTransaction = {
    amount: inputAmount,
    asset: inputCurrency,
    from: accountAddress,
    hash: swap.hash,
    nonce: get(swap, 'nonce'),
    protocol: ProtocolTypes.holy.name,
    status: TransactionStatusTypes.swapping,
    to: get(swap, 'to'),
    type: TransactionTypes.trade,
  };
  logger.log('[holy swap] adding new txn', newTransaction);
  await dispatch(dataAddNewTransaction(newTransaction, accountAddress, true));
  logger.log('[holy swap] calling the callback');
  currentRap.callback();
  currentRap.callback = NOOP;
  try {
    logger.log('[holy swap] waiting for the holy swap to go thru');
    const receipt = await walletToUse.provider.waitForTransaction(swap.hash);
    logger.log('[holy swap] receipt:', receipt);
    if (!isZero(receipt.status)) {
      currentRap.actions[index].transaction.confirmed = true;
      dispatch(rapsAddOrUpdate(currentRap.id, currentRap));
      logger.log('[holy swap] updated raps');
      return;
    } else {
      logger.log('[holy swap] status not success');
      currentRap.actions[index].transaction.confirmed = false;
      dispatch(rapsAddOrUpdate(currentRap.id, currentRap));
      return null;
    }
  } catch (error) {
    logger.log('[holy swap] error waiting for deposit', error);
    currentRap.actions[index].transaction.confirmed = false;
    dispatch(rapsAddOrUpdate(currentRap.id, currentRap));
    return null;
  }
};
