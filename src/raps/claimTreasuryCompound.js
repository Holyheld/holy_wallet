import { concat } from 'lodash';
import { rapsAddOrUpdate } from '../redux/raps';
import store from '../redux/store';
import { createNewAction, createNewRap, RapActionTypes } from './common';
import logger from 'logger';

export const estimateClaimTreasuryCompound = async () => {
  return 0;
};

const createClaimTreasuryCompoundRap = async ({
  callback,
  amount,
  selectedGasPrice,
}) => {
  logger.log('[claim treasury] amount', amount);
  let actions = [];

  // create a deposit rap
  logger.log('[claim treasury] making claim func');
  const deposit = createNewAction(RapActionTypes.treasuryClaim, {
    selectedGasPrice,
  });
  actions = concat(actions, deposit);

  // create the overall rap
  const newRap = createNewRap(actions, callback);

  // update the rap store
  const { dispatch } = store;
  dispatch(rapsAddOrUpdate(newRap.id, newRap));
  logger.log('[claim treasury] new rap!', newRap);
  return newRap;
};

export default createClaimTreasuryCompoundRap;
