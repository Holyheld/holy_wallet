import { concat, reduce } from 'lodash';
import { add } from '../helpers/utilities';
import { rapsAddOrUpdate } from '../redux/raps';
import store from '../redux/store';
import { HOLY_HAND_ADDRESS } from '../references/holy';
import { assetNeedsUnlocking } from './actions/unlock';
import { createNewAction, createNewRap, RapActionTypes } from './common';
import { ethUnits } from '@holyheld-com/references';
import { contractUtils } from '@holyheld-com/utils';
import logger from 'logger';

export const estimateHolySavingsDepositCompound = async ({
  amount,
  currency,
}) => {
  // create unlock rap
  const { accountAddress, network } = store.getState().settings;

  let gasLimits = [];

  const contractAddress = HOLY_HAND_ADDRESS(network);

  const swapAssetNeedsUnlocking = await assetNeedsUnlocking(
    accountAddress,
    amount,
    currency,
    contractAddress
  );

  let depositGasEstimation = ethUnits.basic_approval;

  if (swapAssetNeedsUnlocking) {
    logger.log(
      '[holy savings deposit estimation] we need unlock tokens ',
      amount
    );
    const unlockGasLimit = await contractUtils.estimateApprove(
      currency.address,
      contractAddress
    );
    logger.log(
      '[holy savings deposit estimation] gas for approval ',
      unlockGasLimit
    );
    gasLimits = concat(gasLimits, unlockGasLimit);
  }

  gasLimits = concat(gasLimits, depositGasEstimation);
  logger.log(
    '[holy savings deposit estimation] gas for deposit ',
    depositGasEstimation
  );

  return reduce(gasLimits, (acc, limit) => add(acc, limit), '0');
};

const createHolySavingsDepositCompoundRap = async ({
  callback,
  inputAmount,
  inputCurrency,
  outputCurrency,
  selectedGasPrice,
  transferData,
}) => {
  const { accountAddress, network } = store.getState().settings;
  //const requiresSwap = !!outputCurrency;
  logger.log(
    '[holy savings deposit rap] currencies',
    inputCurrency,
    outputCurrency
  );
  logger.log('[holy savings deposit rap] transfer data', transferData);
  logger.log('[holy savings deposit rap] input amount', inputAmount);
  let actions = [];

  const contractAddress = HOLY_HAND_ADDRESS(network);

  // create unlock token on Compound rap
  const depositAssetNeedsUnlocking = await assetNeedsUnlocking(
    accountAddress,
    inputAmount,
    inputCurrency,
    contractAddress
  );
  if (depositAssetNeedsUnlocking) {
    logger.log('[holy savings deposit rap] making unlock token func');
    const unlockTokenToDeposit = createNewAction(RapActionTypes.unlock, {
      accountAddress,
      amount: inputAmount,
      assetToUnlock: inputCurrency,
      contractAddress: contractAddress,
      selectedGasPrice,
    });
    actions = concat(actions, unlockTokenToDeposit);
  }

  // create a deposit rap
  logger.log('[holy savings deposit rap] making deposit func');
  const deposit = createNewAction(RapActionTypes.holySavingsDeposit, {
    accountAddress,
    inputAmount: inputAmount,
    inputCurrency: inputCurrency,
    network,
    outputCurrency,
    selectedGasPrice,
    transferData,
  });
  actions = concat(actions, deposit);

  // create the overall rap
  const newRap = createNewRap(actions, callback);

  // update the rap store
  const { dispatch } = store;
  dispatch(rapsAddOrUpdate(newRap.id, newRap));
  logger.log('[holy savings deposit rap] new rap!', newRap);
  return newRap;
};

export default createHolySavingsDepositCompoundRap;
