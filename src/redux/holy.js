import produce from 'immer';

// -- Constants ------------------------------------------------------------- //
const HOLY_CLEAR_STATE = 'holy/HOLY_CLEAR_STATE';
const HOLY_UPDATE_SAVINGS = 'holy/HOLY_UPDATE_SAVINGS';
const HOLY_UPDATE_EARLY_LP_BONUS_AMOUNT =
  'holy/HOLY_UPDATE_EARLY_LP_BONUS_AMOUNT';
const HOLY_UPDATE_EARLY_LP_BONUS_SHOW = 'holy/HOLY_UPDATE_EARLY_LP_BONUS_SHOW';
const HOLY_UPDATE_BONUS_RATE = 'holy/HOLY_UPDATE_BONUS_RATE';

// -- Actions --------------------------------------------------------------- //

export const holyUpdateSavings = savings => dispatch => {
  dispatch({
    payload: savings,
    type: HOLY_UPDATE_SAVINGS,
  });
};

export const holyUpdateEarlyLPBonusAmount = amount => dispatch => {
  dispatch({
    payload: amount,
    type: HOLY_UPDATE_EARLY_LP_BONUS_AMOUNT,
  });
};

export const holyUpdateEarlyLPBonusShow = isShow => dispatch => {
  dispatch({
    payload: isShow,
    type: HOLY_UPDATE_EARLY_LP_BONUS_SHOW,
  });
};

export const holyUpdateBonusRate = bonusRate => dispatch => {
  dispatch({
    payload: bonusRate,
    type: HOLY_UPDATE_BONUS_RATE,
  });
};

// -- Reducer --------------------------------------------------------------- //
export const INITIAL_HOLY_STATE = {
  bonusRate: '1.00',
  earlyLPBonus: {
    amount: '0',
    showPanel: false,
  },
  savingsTokens: [
    {
      apy: '29.4',
      balance: '100033.235',
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
  ],
  treasury: {
    balance: '1069.61275411',
    rate: '1.37',
  },
};

export default (state = INITIAL_HOLY_STATE, action) =>
  produce(state, draft => {
    switch (action.type) {
      case HOLY_CLEAR_STATE:
        return INITIAL_HOLY_STATE;
      case HOLY_UPDATE_SAVINGS:
        draft.savingsTokens = action.payload;
        break;
      case HOLY_UPDATE_EARLY_LP_BONUS_AMOUNT:
        draft.earlyLPBonus.amount = action.payload;
        break;
      case HOLY_UPDATE_EARLY_LP_BONUS_SHOW:
        draft.earlyLPBonus.showPanel = action.payload;
        break;
      case HOLY_UPDATE_BONUS_RATE:
        draft.bonusRate = action.payload;
        break;
      default:
        break;
    }
  });
