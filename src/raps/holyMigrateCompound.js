import { concat } from 'lodash';
import { rapsAddOrUpdate } from '../redux/raps';
import store from '../redux/store';
import { HOLY_PASSAGE_ADDRESS } from '../references/holy';
import { assetNeedsUnlocking } from './actions/unlock';
import { createNewAction, createNewRap, RapActionTypes } from './common';
import logger from 'logger';

export const estimateHolyMigrateCompound = async () => {
  return 100000;
};

const createHolyMigrateCompoundRap = async ({
  callback,
  amount,
  currency, // should be HOLY v1
  selectedGasPrice,
}) => {
  logger.log('[holy migrate] amount', amount);
  let actions = [];

  // create unlock rap
  const { accountAddress } = store.getState().settings;

  const swapAssetNeedsUnlocking = await assetNeedsUnlocking(
    accountAddress,
    amount,
    currency,
    HOLY_PASSAGE_ADDRESS
  );

  if (swapAssetNeedsUnlocking) {
    logger.log('[holy migrate] we need unlock tokens ', amount);
    const unlock = createNewAction(RapActionTypes.unlock, {
      accountAddress,
      amount: amount,
      assetToUnlock: currency,
      contractAddress: HOLY_PASSAGE_ADDRESS,
      selectedGasPrice,
    });
    actions = concat(actions, unlock);
  } else {
    logger.log("[holy migrate] we DON'T need unlock tokens ", amount);
  }

  // create a migration rap
  logger.log('[holy migrate] making holy migrate action');
  const migrate = createNewAction(RapActionTypes.holyMigrate, {
    accountAddress,
    amount,
    currency,
    selectedGasPrice,
  });
  actions = concat(actions, migrate);

  // create the overall rap
  const newRap = createNewRap(actions, callback);

  // update the rap store
  const { dispatch } = store;
  dispatch(rapsAddOrUpdate(newRap.id, newRap));
  logger.log('[holy migrate] new rap!', newRap);
  return newRap;
};

export default createHolyMigrateCompoundRap;
