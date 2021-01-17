import { concat, reduce } from 'lodash';
import { add } from '../helpers/utilities';
import { rapsAddOrUpdate } from '../redux/raps';
import store from '../redux/store';
import { ethUnits } from '../references';
import { HOLY_PASSAGE_ADDRESS } from '../references/holy';
import { holyMigrateEstimation } from './actions/holy_migrate';
import { assetNeedsUnlocking } from './actions/unlock';
import { createNewAction, createNewRap, RapActionTypes } from './common';
import { contractUtils } from '@holyheld-com/utils';
import logger from 'logger';

export const estimateHolyMigrateCompound = async (amount, currency) => {
  // create unlock rap
  const { accountAddress, network } = store.getState().settings;

  let gasLimits = [];

  const contractAddress = HOLY_PASSAGE_ADDRESS(network);

  const swapAssetNeedsUnlocking = await assetNeedsUnlocking(
    accountAddress,
    amount,
    currency,
    contractAddress
  );

  let migrationGasLimit = ethUnits.basic_approval;

  if (swapAssetNeedsUnlocking) {
    logger.log('[holy migrate estimation] we need unlock tokens ', amount);
    const unlockGasLimit = await contractUtils.estimateApprove(
      currency.address,
      contractAddress
    );
    logger.log('[holy migrate estimation] gas for approval ', unlockGasLimit);
    gasLimits = concat(gasLimits, unlockGasLimit);
  } else {
    migrationGasLimit = await holyMigrateEstimation();
  }

  gasLimits = concat(gasLimits, migrationGasLimit);
  logger.log('[holy migrate estimation] gas for migration ', migrationGasLimit);

  return reduce(gasLimits, (acc, limit) => add(acc, limit), '0');
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
  const { accountAddress, network } = store.getState().settings;
  const contractAddress = HOLY_PASSAGE_ADDRESS(network);

  const swapAssetNeedsUnlocking = await assetNeedsUnlocking(
    accountAddress,
    amount,
    currency,
    contractAddress
  );

  if (swapAssetNeedsUnlocking) {
    logger.log('[holy migrate] we need unlock tokens ', amount);
    const unlock = createNewAction(RapActionTypes.unlock, {
      accountAddress,
      amount: amount,
      assetToUnlock: currency,
      contractAddress: contractAddress,
      network,
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
    network,
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
