import { rapsAddOrUpdate } from '../redux/raps';
import store from '../redux/store';
import { createNewAction, createNewRap, RapActionTypes } from './common';
import logger from 'logger';

export const estimateHolySavingsWithdrawCompound = async () => {
  return 100000;
};

const createHolySavingsWithdrawCompoundRap = async ({
  callback,
  inputAmount,
  inputCurrency,
  isMax,
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
    isMax,
    network,
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
