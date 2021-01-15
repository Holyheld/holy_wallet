import { concat, reduce } from 'lodash';
import { add } from '../helpers/utilities';
import { rapsAddOrUpdate } from '../redux/raps';
import store from '../redux/store';
import { holyMigrateEstimation } from './actions/holy_migrate';
import { createNewAction, createNewRap, RapActionTypes } from './common';
import logger from 'logger';

export const estimateHolyClaimCompound = async () => {
  let gasLimits = [];

  const claimGasLimit = await holyMigrateEstimation();

  gasLimits = concat(gasLimits, claimGasLimit);
  logger.log('[holy claim estimation] gas for claiming ', claimGasLimit);

  return reduce(gasLimits, (acc, limit) => add(acc, limit), '0');
};

const createHolyClaimCompoundRap = async ({
  callback,
  amount,
  currency, // should be HH v2
  selectedGasPrice,
}) => {
  logger.log('[holy claim] amount', amount);
  let actions = [];

  const { accountAddress, network } = store.getState().settings;
  // create a claim rap
  logger.log('[holy claim] making holy claim action');
  const claimAction = createNewAction(RapActionTypes.holyBonusClaim, {
    accountAddress,
    amount,
    currency,
    network,
    selectedGasPrice,
  });
  actions = concat(actions, claimAction);

  // create the overall rap
  const newRap = createNewRap(actions, callback);

  // update the rap store
  const { dispatch } = store;
  dispatch(rapsAddOrUpdate(newRap.id, newRap));
  logger.log('[holy claim] new rap!', newRap);
  return newRap;
};

export default createHolyClaimCompoundRap;
