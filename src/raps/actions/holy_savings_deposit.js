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
  divide,
  isZero,
  multiply,
} from '../../helpers/utilities';
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

export const holySavingsDepositEstimation = async ({
  accountAddress,
  inputAmount,
  inputCurrency,
  network,
  transferData,
}) => {
  logger.log('[holy savings deposit estimation] estimation');

  if (!inputAmount) {
    logger.log(
      '[holy savings deposit estimation] input amount or transfer data is null - return basic value'
    );

    return ethUnits.basic_holy_savings_deposit;
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

    const poolAddress = HOLY_SAVINGS_POOL_ADDRESS(network);

    logger.log('[holy savings deposit estimation] pool address', poolAddress);

    const inputAmountInWEI = convertAmountToRawAmount(
      inputAmount,
      inputCurrency.decimals
    );

    logger.log(
      '[holy savings deposit estimation] input amount in WEI:',
      inputAmountInWEI
    );

    let bytesData = [];
    let expectedMinimumReceived = '0';

    if (transferData) {
      expectedMinimumReceived = new BigNumber(
        multiply(transferData.buyAmount, '0.85')
      ).toFixed(0);

      logger.log(
        '[holy savings deposit estimation] expected minimum received:',
        expectedMinimumReceived
      );

      const valueBytes = arrayify(
        hexZeroPad(convertStringToHexWithPrefix(transferData.value), 32)
      );
      logger.log(
        '[holy savings deposit estimation] valueBytes:',
        hexlify(valueBytes)
      );

      bytesData = concat([
        arrayify(transferData.to),
        arrayify(transferData.allowanceTarget),
        valueBytes,
        arrayify(transferData.data),
      ]);

      logger.log(
        '[holy savings deposit estimation] bytesData:',
        hexlify(bytesData)
      );
    }

    logger.log(
      '[holy savings deposit estimation] transactionParams:',
      transactionParams
    );

    let inputCurrencyAddress = inputCurrency.address;
    if (inputCurrency.address === 'eth') {
      inputCurrencyAddress = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
    }

    logger.log(
      '[holy savings deposit estimation] inputCurrencyAddress:',
      inputCurrencyAddress
    );

    const gasLimit = await holyHand.estimateGas.depositToPool(
      poolAddress,
      inputCurrencyAddress,
      inputAmountInWEI,
      expectedMinimumReceived,
      bytesData,
      transactionParams
    );

    let gasLimitString = gasLimit.toString();
    logger.log(
      '[holy savings deposit estimation] gas estimation by ether.js: ' +
        gasLimitString
    );

    if (gasLimitString) {
      gasLimitString = divide(multiply(gasLimitString, '120'), '100');
      logger.log(
        '[holy swap estimation] gas estimation by ether.js (with additional 20% as buffer): ' +
          gasLimitString
      );
      return gasLimitString;
    } else {
      return ethUnits.basic_holy_savings_deposit;
    }
  } catch (error) {
    logger.log('error holy_savings_deposit estimate');
    logger.log(error);
    captureException(error);
    return ethUnits.basic_holy_savings_deposit;
  }
};

export const holySavingsDeposit = async (
  wallet,
  currentRap,
  index,
  parameters
) => {
  logger.log('[holy savings deposit] start holy deposit!');
  const {
    accountAddress,
    network,
    inputAmount,
    inputCurrency,
    selectedGasPrice,
    transferData,
  } = parameters;
  const { dispatch } = store;

  let gasPrice = get(selectedGasPrice, 'value.amount');
  const gasLimit = await holySavingsDepositEstimation({
    accountAddress,
    inputAmount,
    inputCurrency,
    network,
    transferData,
  });

  const contractAddress = HOLY_HAND_ADDRESS(network);
  const contractABI = HOLY_HAND_ABI;

  let deposit;

  const walletToUse = wallet || (await loadWallet());
  if (!walletToUse) return null;

  try {
    logger.log('[holy savings deposit] gas Limit and price:', {
      gasLimit,
      gasPrice,
    });

    const holyHand = new Contract(contractAddress, contractABI, walletToUse);

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

    const poolAddress = HOLY_SAVINGS_POOL_ADDRESS(network);

    logger.log('[holy savings deposit] pool address', poolAddress);

    const inputAmountInWEI = convertAmountToRawAmount(
      inputAmount,
      inputCurrency.decimals
    );

    logger.log('[holy savings deposit] input amount in WEI:', inputAmountInWEI);

    let bytesData = [];
    let expectedMinimumReceived = '0';

    if (transferData) {
      expectedMinimumReceived = new BigNumber(
        multiply(transferData.buyAmount, '0.85')
      ).toFixed(0);

      logger.log(
        '[holy savings deposit] expected minimum received:',
        expectedMinimumReceived
      );

      const valueBytes = arrayify(
        hexZeroPad(convertStringToHexWithPrefix(transferData.value), 32)
      );
      logger.log('[holy savings deposit] valueBytes:', hexlify(valueBytes));

      bytesData = concat([
        arrayify(transferData.to),
        arrayify(transferData.allowanceTarget),
        valueBytes,
        arrayify(transferData.data),
      ]);

      logger.log('[holy savings deposit] bytesData:', hexlify(bytesData));
    }

    logger.log('[holy savings deposit] transactionParams:', transactionParams);

    let inputCurrencyAddress = inputCurrency.address;
    if (inputCurrency.address === 'eth') {
      inputCurrencyAddress = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
    }

    logger.log(
      '[holy savings deposit] inputCurrencyAddress:',
      inputCurrencyAddress
    );

    deposit = await holyHand.depositToPool(
      poolAddress,
      inputCurrencyAddress,
      inputAmountInWEI,
      expectedMinimumReceived,
      bytesData,
      transactionParams
    );
  } catch (e) {
    logger.log('[holy savings deposit] error executing holy deposit', e);
    captureException(e);
    throw e;
  }

  logger.log('[holy savings deposit] response', deposit);
  currentRap.actions[index].transaction.hash = deposit.hash;
  dispatch(rapsAddOrUpdate(currentRap.id, currentRap));
  logger.log('[holy savings deposit] adding a new holy txn', deposit.hash);
  const newTransaction = {
    amount: inputAmount,
    asset: inputCurrency,
    from: accountAddress,
    hash: deposit.hash,
    nonce: get(deposit, 'nonce'),
    protocol: ProtocolTypes.holy.name,
    status: TransactionStatusTypes.depositing,
    to: get(deposit, 'to'),
    type: TransactionTypes.deposit,
  };
  logger.log('[holy savings deposit] adding new txn', newTransaction);
  await dispatch(dataAddNewTransaction(newTransaction, accountAddress, true));
  logger.log('[holy savings deposit] calling the callback');
  currentRap.callback();
  currentRap.callback = NOOP;
  try {
    logger.log(
      '[holy savings deposit] waiting for the holy deposit to go thru'
    );
    const receipt = await walletToUse.provider.waitForTransaction(deposit.hash);
    logger.log('[holy savings deposit] receipt:', receipt);
    if (!isZero(receipt.status)) {
      currentRap.actions[index].transaction.confirmed = true;
      dispatch(rapsAddOrUpdate(currentRap.id, currentRap));
      logger.log('[holy savings deposit] updated raps');
      return;
    } else {
      logger.log('[holy savings deposit] status not success');
      currentRap.actions[index].transaction.confirmed = false;
      dispatch(rapsAddOrUpdate(currentRap.id, currentRap));
      return null;
    }
  } catch (error) {
    logger.log('[holy savings deposit] error waiting for deposit', error);
    currentRap.actions[index].transaction.confirmed = false;
    dispatch(rapsAddOrUpdate(currentRap.id, currentRap));
    return null;
  }
};
