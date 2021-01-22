import produce from 'immer';

// -- Constants ------------------------------------------------------------- //
const HOLY_CLEAR_STATE = 'holy/HOLY_CLEAR_STATE';
const HOLY_UPDATE_SAVINGS = 'holy/HOLY_UPDATE_SAVINGS';
const HOLY_UPDATE_EARLY_LP_BONUS_AMOUNT =
  'holy/HOLY_UPDATE_EARLY_LP_BONUS_AMOUNT';
const HOLY_UPDATE_EARLY_LP_BONUS_SHOW = 'holy/HOLY_UPDATE_EARLY_LP_BONUS_SHOW';
const HOLY_UPDATE_BONUS_RATE = 'holy/HOLY_UPDATE_BONUS_RATE';
const HOLY_UPDATE_BONUS_FULL_CAP = 'holy/HOLY_UPDATE_BONUS_FULL_CAP';
const HOLY_UPDATE_BONUS_DPY = 'holy/HOLY_UPDATE_BONUS_DPY';
const PRICE_HOLY_UPDATE = 'holy/PIRCE_HOLY_UPDATE';
const PRICE_HH_UPDATE = 'holy/PRICE_HH_UPDATE';

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

export const holyUpdateFullCap = fullCap => dispatch => {
  dispatch({
    payload: fullCap,
    type: HOLY_UPDATE_BONUS_FULL_CAP,
  });
};

export const holyUpdateBonusDPY = dpy => dispatch => {
  dispatch({
    payload: dpy,
    type: HOLY_UPDATE_BONUS_DPY,
  });
};

export const updateHolyPrice = (nativePrice, priceInEth) => dispatch => {
  dispatch({
    payload: {
      inEth: priceInEth,
      inNative: nativePrice,
    },
    type: PRICE_HOLY_UPDATE,
  });
};

export const updateHHPrice = (nativePrice, priceInEth) => dispatch => {
  dispatch({
    payload: {
      inEth: priceInEth,
      inNative: nativePrice,
    },
    type: PRICE_HH_UPDATE,
  });
};

// -- Reducer --------------------------------------------------------------- //
export const INITIAL_HOLY_STATE = {
  bonusRate: '1.00',
  earlyLPBonus: {
    amountToClaim: '0',
    dpy: '0',
    fullCap: '0',
    showPanel: false,
  },
  prices: {
    HH: {
      inEth: '1',
      inNative: '1',
    },
    HOLY: {
      inEth: '1',
      inNative: '1',
    },
    USDC: {
      inEth: '1',
      inNative: '1',
    },
  },
  savings: {
    apy: '29.4',
    balance: '0',
  },
  treasury: {
    balance: '0',
    rate: '1',
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
        draft.earlyLPBonus.amountToClaim = action.payload;
        break;
      case HOLY_UPDATE_EARLY_LP_BONUS_SHOW:
        draft.earlyLPBonus.showPanel = action.payload;
        break;
      case HOLY_UPDATE_BONUS_RATE:
        draft.bonusRate = action.payload;
        break;
      case HOLY_UPDATE_BONUS_FULL_CAP:
        draft.earlyLPBonus.fullCap = action.payload;
        break;
      case PRICE_HOLY_UPDATE:
        draft.prices.HOLY = action.payload;
        break;
      case PRICE_HH_UPDATE:
        draft.prices.HH = action.payload;
        break;
      case HOLY_UPDATE_BONUS_DPY:
        draft.earlyLPBonus.dpy = action.payload;
        break;
      default:
        break;
    }
  });
