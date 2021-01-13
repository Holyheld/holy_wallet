import { Contract } from '@ethersproject/contracts';
import { captureException } from '@sentry/react-native';
import { holyUpdateEarlyLPBonus, holyUpdateSavings } from '../redux/holy';
import { HOLY_PASSAGE_ABI, HOLY_PASSAGE_ADDRESS } from '../references/holy';
import { web3Provider } from './web3';
import logger from 'logger';

const holySavingsRefreshState = () => async dispatch => {
  // request to smart contract here
  logger.sentry('refreshing HOLY savings');
  const savings = [
    {
      apy: '1.5',
      balance: '10',
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
  const { network } = getState().settings;
  const contractAddress = HOLY_PASSAGE_ADDRESS(network);
  const contractABI = HOLY_PASSAGE_ABI;

  const holyPassage = new Contract(contractAddress, contractABI, web3Provider);

  try {
    logger.sentry('refreshing HOLY early LP bonuses');
    const claimableBonus = await holyPassage.getClaimableBonus();
    logger.sentry('HOLY early LP bonuses: ' + claimableBonus);
    dispatch(
      holyUpdateEarlyLPBonus(claimableBonus ? claimableBonus.toString() : '0')
    );
  } catch (error) {
    logger.sentry('error refreshing HOLY early LP bonuses');
    logger.sentry(error);
    captureException(error);
    dispatch(holyUpdateEarlyLPBonus('0'));
  }
};

export const refreshHoly = () => async dispatch => {
  dispatch(holySavingsRefreshState());
  dispatch(holyEarlyLPBonusesRefresh());
};
