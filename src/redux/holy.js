import produce from 'immer';

// -- Constants ------------------------------------------------------------- //
const HOLY_CLEAR_STATE = 'holy/HOLY_CLEAR_STATE';
const HOLY_UPDATE_SAVINGS_BALANCE_USDC =
  'holy/HOLY_UPDATE_SAVINGS_BALANCE_USDC';
const HOLY_UPDATE_SAVINGS_APY = 'holy/HOLY_UPDATE_SAVINGS_APY';
const HOLY_UPDATE_EARLY_LP_BONUS_AMOUNT =
  'holy/HOLY_UPDATE_EARLY_LP_BONUS_AMOUNT';
const HOLY_UPDATE_EARLY_LP_BONUS_SHOW = 'holy/HOLY_UPDATE_EARLY_LP_BONUS_SHOW';
const HOLY_UPDATE_BONUS_RATE = 'holy/HOLY_UPDATE_BONUS_RATE';
const HOLY_UPDATE_BONUS_FULL_CAP = 'holy/HOLY_UPDATE_BONUS_FULL_CAP';
const HOLY_UPDATE_BONUS_DPY = 'holy/HOLY_UPDATE_BONUS_DPY';
const PRICE_HH_IN_WETH_UPDATE = 'holy/PRICE_HH_IN_WETH_UPDATE';
const PRICE_HH_NATIVE_UPDATE = 'holy/PRICE_HH_NATIVE_UPDATE';

// -- Actions --------------------------------------------------------------- //

export const holyUpdateSavingsBalanceUCDS = balanceInUSDc => dispatch => {
  dispatch({
    payload: balanceInUSDc,
    type: HOLY_UPDATE_SAVINGS_BALANCE_USDC,
  });
};

export const holyUpdateSavingsAPY = ({ apy, dpy }) => dispatch => {
  dispatch({
    payload: { apy, dpy },
    type: HOLY_UPDATE_SAVINGS_APY,
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

export const updateHHInWETHPrice = priceInEth => dispatch => {
  dispatch({
    payload: priceInEth,
    type: PRICE_HH_IN_WETH_UPDATE,
  });
};

export const updateHHNativePrice = nativePrice => dispatch => {
  dispatch({
    payload: nativePrice,
    type: PRICE_HH_NATIVE_UPDATE,
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
      inEth: '0',
      inNative: '0',
    },
    USDC: {
      inEth: '1',
      inNative: '1',
    },
  },
  savings: {
    apy: '0',
    balanceUSDC: '0',
    dpy: '0',
  },
  treasury: {
    allBalanceNative: '0',
    allBalanceUSDC: '0',
    apy: '20.1',
    bonusBalanceNative: '0',
    bonusBalanceUSDC: '0',
    hh: '0',
    hhEthLP: '0',
    rate: '1',
  },
};

export default (state = INITIAL_HOLY_STATE, action) =>
  produce(state, draft => {
    switch (action.type) {
      case HOLY_CLEAR_STATE:
        return INITIAL_HOLY_STATE;
      case HOLY_UPDATE_SAVINGS_BALANCE_USDC:
        draft.savings.balanceUSDC = action.payload;
        break;
      case HOLY_UPDATE_SAVINGS_APY:
        draft.savings.apy = action.payload.apy;
        draft.savings.dpy = action.payload.dpy;
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
      case PRICE_HH_NATIVE_UPDATE:
        draft.prices.HH.inNative = action.payload;
        break;
      case PRICE_HH_IN_WETH_UPDATE:
        draft.prices.HH.inEth = action.payload;
        break;
      case HOLY_UPDATE_BONUS_DPY:
        draft.earlyLPBonus.dpy = action.payload;
        break;
      default:
        break;
    }
  });
