import { Contract } from '@ethersproject/contracts';
import { captureException } from '@sentry/react-native';
import BigNumber from 'bignumber.js';
import {
  holyUpdateBonusRate,
  holyUpdateEarlyLPBonus,
  holyUpdateSavings,
} from '../redux/holy';
import {
  HOLY_PASSAGE_ABI,
  HOLY_PASSAGE_ADDRESS,
  HOLY_VISOR_ABI,
  HOLY_VISOR_ADDRESS,
} from '../references/holy';
import { web3Provider } from './web3';
import logger from 'logger';

const holySavingsRefreshState = () => async dispatch => {
  // request to smart contract here
  logger.sentry('refreshing HOLY savings');
  const savings = [
    {
      apy: '1.5',
      balance: '0',
      native: {
        price: {
          amount: '1',
        },
      },
      underlying: {
        address: '0x6b175474e89094c44da98b954eedeac495271d1f', // TODO: real address
        symbol: 'USDC',
      },
    },
  ];

  dispatch(holyUpdateSavings(savings));
};

const holyEarlyLPBonusesRefresh = () => async (dispatch, getState) => {
  const { network, accountAddress } = getState().settings;
  const contractAddress = HOLY_PASSAGE_ADDRESS(network);
  const contractABI = HOLY_PASSAGE_ABI;

  const holyPassage = new Contract(contractAddress, contractABI, web3Provider);

  try {
    logger.sentry('refreshing HOLY early LP bonuses');
    let claimableBonus = await holyPassage.getClaimableBonus({
      from: accountAddress,
    });
    logger.sentry('HOLY bonus rate in WEI: ', claimableBonus);
    claimableBonus = new BigNumber(claimableBonus.toString());
    claimableBonus = claimableBonus
      .dividedBy(new BigNumber(10).pow(new BigNumber(18)))
      .toFixed();
    logger.sentry('HOLY claimable bonuses: ', claimableBonus);

    dispatch(holyUpdateEarlyLPBonus(claimableBonus.toString()));
  } catch (error) {
    logger.sentry('error refreshing HOLY early LP bonuses');
    logger.sentry(error);
    captureException(error);
    dispatch(holyUpdateEarlyLPBonus('0'));
  }

  const visorAddress = HOLY_VISOR_ADDRESS(network);
  const visorABI = HOLY_VISOR_ABI;

  const holyVisor = new Contract(visorAddress, visorABI, web3Provider);

  try {
    logger.sentry('refreshing HOLY bonus rate');
    let bonusRate = await holyVisor.bonusMultipliers(accountAddress, {
      from: accountAddress,
    });
    logger.sentry('HOLY bonus rate in WEI: ', bonusRate);
    bonusRate = new BigNumber(bonusRate.toString());
    bonusRate = bonusRate.dividedBy(new BigNumber(10).pow(new BigNumber(18)));
    logger.sentry('HOLY bonus rate: ', bonusRate);
    dispatch(holyUpdateBonusRate(bonusRate.toString()));
  } catch (error) {
    logger.sentry('error refreshing HOLY bonus rate');
    logger.sentry(error);
    captureException(error);
    dispatch(holyUpdateBonusRate('1'));
  }
};

export const refreshHoly = () => async dispatch => {
  dispatch(holySavingsRefreshState());
  dispatch(holyEarlyLPBonusesRefresh());
};
