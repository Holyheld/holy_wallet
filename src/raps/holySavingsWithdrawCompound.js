import { rapsAddOrUpdate } from '../redux/raps';
import store from '../redux/store';
import { holySavingsWithdrawEstimation } from './actions/holy_savings_withdraw';
import { createNewAction, createNewRap, RapActionTypes } from './common';
import logger from 'logger';

export const estimateHolySavingsWithdrawCompound = async ({
  inputAmount,
  inputCurrency,
}) => {
  const estimationGas = holySavingsWithdrawEstimation({
    inputAmount,
    inputCurrency,
  });
  logger.log(
    '[holy savings withdraw estimation] gas for withdraw ',
    estimationGas
  );

  return estimationGas;
};

const createHolySavingsWithdrawCompoundRap = async ({
  callback,
  inputAmount,
  inputCurrency,
  outputCurrency,
  selectedGasPrice,
}) => {
  logger.log('[holy withdraw rap] amount', inputAmount);
  const { accountAddress, network } = store.getState().settings;

  // create a withdraw rap
  logger.log('[holy withdraw rap] making redeem func');
  const withdraw = createNewAction(RapActionTypes.holySavingsWithdraw, {
    accountAddress,
    inputAmount,
    inputCurrency,
    network,
    outputCurrency,
    selectedGasPrice,
  });
  const actions = [withdraw];

  // create the overall rap
  const newRap = createNewRap(actions, callback);

  // update the rap store
  const { dispatch } = store;
  dispatch(rapsAddOrUpdate(newRap.id, newRap));
  logger.log('[holy withdraw rap] new rap!', newRap);
  return newRap;
};

export default createHolySavingsWithdrawCompoundRap;
