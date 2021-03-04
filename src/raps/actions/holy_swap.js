import { arrayify, concat, hexlify, hexZeroPad } from '@ethersproject/bytes';
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
  floorDivide,
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

    return {
      gasLimit: ethUnits.basic_holy_swap,
      gasLimitWithBuffer: ethUnits.basic_holy_swap,
    };
  }

  const contractAddress = HOLY_HAND_ADDRESS(network);
  const contractABI = HOLY_HAND_ABI;

  try {
    const holyHand = new Contract(contractAddress, contractABI, web3Provider);

    let value = undefined;

    if (transferData) {
      value = toHex(transferData.value);
    }

    const transactionParams = {
      from: accountAddress,
      value: value,
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

    logger.log('[holy swap estimation] transactionParams:', transactionParams);

    let inputCurrencyAddress = inputCurrency.address;
    if (inputCurrency.address === 'eth') {
      inputCurrencyAddress = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
    }

    let outputCurrencyAddress = outputCurrency.address;
    if (outputCurrency.address === 'eth') {
      outputCurrencyAddress = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
    }

    logger.log(
      '[holy swap estimation] inputCurrencyAddress:',
      inputCurrencyAddress
    );
    logger.log(
      '[holy swap estimation] outputCurrencyAddress:',
      outputCurrencyAddress
    );

    const gasLimitObj = await holyHand.estimateGas.executeSwap(
      inputCurrencyAddress,
      outputCurrencyAddress,
      inputAmountInWEI,
      expectedMinimumReceived,
      bytesData,
      transactionParams
    );

    const gasLimit = gasLimitObj.toString();
    logger.log(
      '[holy swap estimation] gas estimation by ether.js: ' + gasLimit
    );
    if (gasLimit) {
      const gasLimitWithBuffer = floorDivide(multiply(gasLimit, '120'), '100');
      logger.log(
        '[holy swap estimation] gas estimation by ether.js (with additional 20% as buffer): ' +
          gasLimitWithBuffer
      );
      return { gasLimit, gasLimitWithBuffer };
    } else {
      return {
        gasLimit: ethUnits.basic_holy_swap,
        gasLimitWithBuffer: ethUnits.basic_holy_swap,
      };
    }
  } catch (error) {
    logger.log('error holy swap estimate');
    logger.log(error);
    captureException(error);
    return {
      gasLimit: ethUnits.basic_holy_swap,
      gasLimitWithBuffer: ethUnits.basic_holy_swap,
    };
  }
};

export const holySwap = async (wallet, currentRap, index, parameters) => {
  logger.log('[holy swap] start holy swap!');
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
  const {
    gasLimit: gasLimitWithoutBuffer,
    gasLimitWithBuffer,
  } = await holySwapEstimation({
    accountAddress,
    inputAmount,
    inputCurrency,
    network,
    outputCurrency,
    transferData,
  });

  const gasLimit = gasLimitWithBuffer;

  const contractAddress = HOLY_HAND_ADDRESS(network);
  const contractABI = HOLY_HAND_ABI;

  let swap;

  const walletToUse = wallet || (await loadWallet());
  if (!walletToUse) return null;

  let value = undefined;

  if (transferData) {
    value = toHex(transferData.value);
  }

  const transactionParams = {
    from: accountAddress,
    gasLimit: toHex(gasLimit) || undefined,
    gasPrice: toHex(gasPrice) || undefined,
    value: value,
  };

  try {
    logger.log('[holy swap] gas Limit and price:', {
      gasLimit,
      gasPrice,
    });

    const holyHand = new Contract(contractAddress, contractABI, walletToUse);

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
        hexZeroPad(convertStringToHexWithPrefix(transferData.value), 32)
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

    logger.log('[holy swap] transactionParams:', transactionParams);

    let inputCurrencyAddress = inputCurrency.address;
    if (inputCurrency.address === 'eth') {
      inputCurrencyAddress = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
    }

    let outputCurrencyAddress = outputCurrency.address;
    if (outputCurrency.address === 'eth') {
      outputCurrencyAddress = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
    }

    logger.log('[holy swap] inputCurrencyAddress:', inputCurrencyAddress);
    logger.log('[holy swap] outputCurrencyAddress:', outputCurrencyAddress);

    swap = await holyHand.executeSwap(
      inputCurrencyAddress,
      outputCurrencyAddress,
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

  logger.sentry(
    `New transaction with hash: ${swap.hash}, pure gas estimation: ${gasLimitWithoutBuffer}, gas estimation with buffer: ${gasLimitWithBuffer}`
  );

  logger.log('[holy swap] response', swap);
  currentRap.actions[index].transaction.hash = swap.hash;
  dispatch(rapsAddOrUpdate(currentRap.id, currentRap));
  logger.log('[holy swap] adding a new holy txn', swap.hash);
  const newTransaction = {
    amount: inputAmount,
    asset: inputCurrency,
    from: accountAddress,
    gasLimit: transactionParams.gasLimit,
    gasPrice: transactionParams.gasPrice,
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
    logger.log('[holy swap] error waiting for swap', error);
    currentRap.actions[index].transaction.confirmed = false;
    dispatch(rapsAddOrUpdate(currentRap.id, currentRap));
    return null;
  }
};
