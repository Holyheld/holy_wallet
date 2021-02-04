import { concat, reduce } from 'lodash';
import { add } from '../helpers/utilities';
import { rapsAddOrUpdate } from '../redux/raps';
import store from '../redux/store';
import { ethUnits } from '../references';
import { HOLY_HAND_ADDRESS } from '../references/holy';
import { holySwapEstimation } from './actions/holy_swap';
import { assetNeedsUnlocking } from './actions/unlock';
import { createNewAction, createNewRap, RapActionTypes } from './common';
import { contractUtils } from '@holyheld-com/utils';
import logger from 'logger';

export const estimateHolySwapCompound = async ({
  inputAmount,
  inputCurrency,
  outputCurrency,
  transferData,
}) => {
  const { accountAddress, network } = store.getState().settings;

  let gasLimits = [];

  const contractAddress = HOLY_HAND_ADDRESS(network);

  const swapAssetNeedsUnlocking = await assetNeedsUnlocking(
    accountAddress,
    inputAmount,
    inputCurrency,
    contractAddress
  );

  let swapGasEstimation = ethUnits.basic_holy_swap;

  if (swapAssetNeedsUnlocking && inputAmount) {
    logger.log('[holy swap estimation] we need unlock tokens ', inputAmount);
    const unlockGasLimit = await contractUtils.estimateApprove(
      inputCurrency.address,
      contractAddress
    );
    logger.log('[holy swap estimation] gas for approval ', unlockGasLimit);
    gasLimits = concat(gasLimits, unlockGasLimit);
  } else {
    swapGasEstimation = await holySwapEstimation({
      accountAddress,
      inputAmount,
      inputCurrency,
      network,
      outputCurrency,
      transferData,
    });
  }
  gasLimits = concat(gasLimits, swapGasEstimation);

  return reduce(gasLimits, (acc, limit) => add(acc, limit), '0');
};

const createHolySwapCompoundRap = async ({
  callback,
  inputAmount,
  inputCurrency,
  outputCurrency,
  selectedGasPrice,
  transferData,
}) => {
  const { accountAddress, network } = store.getState().settings;
  logger.log('[holy swap rap] currencies', inputCurrency, outputCurrency);
  logger.log('[holy swap rap] transfer data', transferData);
  logger.log('[holy swap rap] input amount', inputAmount);
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

  // create a holy swap rap
  logger.log('[holy swap rap] making deposit func');
  const deposit = createNewAction(RapActionTypes.holySwap, {
    accountAddress,
    inputAmount,
    inputCurrency,
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
  logger.log('[holy swap rap] new rap!', newRap);
  return newRap;
};

export default createHolySwapCompoundRap;
