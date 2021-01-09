import { concat } from 'lodash';
import { rapsAddOrUpdate } from '../redux/raps';
import store from '../redux/store';
import { createNewAction, createNewRap, RapActionTypes } from './common';
import logger from 'logger';

export const estimateHolySavingsDepositCompound = async () => {
  return 100000;
};

const createHolySavingsDepositCompoundRap = async ({
  callback,
  inputAmount,
  inputCurrency,
  outputAmount,
  outputCurrency,
  selectedGasPrice,
}) => {
  const { accountAddress, network } = store.getState().settings;
  //const requiresSwap = !!outputCurrency;
  logger.log(
    '[holy savings deposit rap] currencies',
    inputCurrency,
    outputCurrency
  );
  logger.log('[holy savings deposit rap] amounts', inputAmount, outputAmount);
  let actions = [];

  // const tokenToDeposit = requiresSwap ? outputCurrency : inputCurrency;
  // const cTokenContract =
  //   savingsAssetsListByUnderlying[network][tokenToDeposit.address]
  //     .contractAddress;
  // logger.log('ctokencontract', cTokenContract);

  // // create unlock token on Compound rap
  // const depositAssetNeedsUnlocking = await assetNeedsUnlocking(
  //   accountAddress,
  //   requiresSwap ? outputAmount : inputAmount,
  //   tokenToDeposit,
  //   cTokenContract
  // );
  // if (depositAssetNeedsUnlocking) {
  //   logger.log('[swap and deposit] making unlock token func');
  //   const unlockTokenToDeposit = createNewAction(RapActionTypes.unlock, {
  //     accountAddress,
  //     amount: requiresSwap ? outputAmount : inputAmount,
  //     assetToUnlock: tokenToDeposit,
  //     contractAddress: cTokenContract,
  //     selectedGasPrice,
  //   });
  //   actions = concat(actions, unlockTokenToDeposit);
  // }

  // create a deposit rap
  logger.log('[holy savings deposit rap] making deposit func');
  const deposit = createNewAction(RapActionTypes.depositCompound, {
    accountAddress,
    inputAmount: inputAmount,
    inputCurrency: inputCurrency,
    network,
    selectedGasPrice,
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
