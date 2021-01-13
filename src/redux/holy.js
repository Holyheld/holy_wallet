import produce from 'immer';

// -- Constants ------------------------------------------------------------- //
const HOLY_CLEAR_STATE = 'holy/HOLY_CLEAR_STATE';
const HOLY_UPDATE_SAVINGS = 'holy/HOLY_UPDATE_SAVINGS';
const HOLY_UPDATE_EARLY_LP_BONUSES = 'holy/HOLY_UPDATE_EARLY_LP_BONUSES';

// -- Actions --------------------------------------------------------------- //

export const holyUpdateSavings = savings => dispatch => {
  dispatch({
    payload: savings,
    type: HOLY_UPDATE_SAVINGS,
  });
};

export const holyUpdateEarlyLPBonus = earlyLPBonus => dispatch => {
  dispatch({
    payload: earlyLPBonus,
    type: HOLY_UPDATE_EARLY_LP_BONUSES,
  });
};

// -- Reducer --------------------------------------------------------------- //
export const INITIAL_HOLY_STATE = {
  earlyLPBonus: '0',
  savingsTokens: [
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
  ],
};

export default (state = INITIAL_HOLY_STATE, action) =>
  produce(state, draft => {
    switch (action.type) {
      case HOLY_CLEAR_STATE:
        return INITIAL_HOLY_STATE;
      case HOLY_UPDATE_SAVINGS:
        draft.savingsTokens = action.payload;
        break;
      case HOLY_UPDATE_EARLY_LP_BONUSES:
        draft.earlyLPBonus = action.payload;
        break;
      default:
        break;
    }
  });
