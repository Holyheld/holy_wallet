import produce from 'immer';
import {
  getLPBonusToggle,
  getOpenFamilies,
  getOpenInvestmentCards,
  getSavingsToggle,
  getSmallBalanceToggle,
  getTreasuryBankToggle,
  saveLPBonusToggle,
  saveOpenFamilies,
  saveOpenInvestmentCards,
  saveSavingsToggle,
  saveSmallBalanceToggle,
  saveTreasuryBankToggle,
} from '../handlers/localstorage/accountLocal';

// -- Constants ------------------------------------------------------------- //
const OPEN_STATE_SETTINGS_LOAD_SUCCESS =
  'openStateSettings/OPEN_STATE_SETTINGS_LOAD_SUCCESS';
const OPEN_STATE_SETTINGS_LOAD_FAILURE =
  'openStateSettings/OPEN_STATE_SETTINGS_LOAD_FAILURE';
const CLEAR_OPEN_STATE_SETTINGS = 'openStateSettings/CLEAR_OPEN_STATE_SETTINGS';
const PUSH_OPEN_FAMILY_TAB = 'openStateSettings/PUSH_OPEN_FAMILY_TAB';
const SET_OPEN_FAMILY_TABS = 'openStateSettings/SET_OPEN_FAMILY_TABS';
const SET_OPEN_SAVINGS = 'openStateSettings/SET_OPEN_SAVINGS';
const SET_OPEN_TREASURY_BANK = 'openStateSettings/SET_OPEN_TREASURY_BANK';
const SET_OPEN_TOKEN_MIGRATION = 'openStateSettings/SET_OPEN_TOKEN_MIGRATION';
const SET_OPEN_SMALL_BALANCES = 'openStateSettings/SET_OPEN_SMALL_BALANCES';
const SET_OPEN_INVESTMENT_CARDS = 'openStateSettings/SET_OPEN_INVESTMENT_CARDS';

// -- Actions --------------------------------------------------------------- //
export const openStateSettingsLoadState = () => async (dispatch, getState) => {
  try {
    const { accountAddress, network } = getState().settings;
    const openSavings = await getSavingsToggle(accountAddress, network);
    const openTreasuryBank = await getTreasuryBankToggle(
      accountAddress,
      network
    );
    const openLPBonus = await getLPBonusToggle(accountAddress, network);
    const openSmallBalances = await getSmallBalanceToggle(
      accountAddress,
      network
    );
    const openInvestmentCards = await getOpenInvestmentCards(
      accountAddress,
      network
    );
    const openFamilyTabs = await getOpenFamilies(accountAddress, network);
    dispatch({
      payload: {
        openFamilyTabs,
        openInvestmentCards,
        openLPBonus,
        openSavings,
        openSmallBalances,
        openTreasuryBank,
      },
      type: OPEN_STATE_SETTINGS_LOAD_SUCCESS,
    });
  } catch (error) {
    dispatch({ type: OPEN_STATE_SETTINGS_LOAD_FAILURE });
  }
};

export const setOpenSavings = payload => (dispatch, getState) => {
  const { accountAddress, network } = getState().settings;
  saveSavingsToggle(payload, accountAddress, network);
  dispatch({
    payload,
    type: SET_OPEN_SAVINGS,
  });
};

export const setOpenTreasuryBank = payload => (dispatch, getState) => {
  const { accountAddress, network } = getState().settings;
  saveTreasuryBankToggle(payload, accountAddress, network);
  dispatch({
    payload,
    type: SET_OPEN_TREASURY_BANK,
  });
};

export const setOpenLPBonus = payload => (dispatch, getState) => {
  const { accountAddress, network } = getState().settings;
  saveLPBonusToggle(payload, accountAddress, network);
  dispatch({
    payload,
    type: SET_OPEN_TOKEN_MIGRATION,
  });
};

export const setOpenSmallBalances = payload => (dispatch, getState) => {
  const { accountAddress, network } = getState().settings;
  saveSmallBalanceToggle(payload, accountAddress, network);
  dispatch({
    payload,
    type: SET_OPEN_SMALL_BALANCES,
  });
};

export const pushOpenFamilyTab = payload => dispatch =>
  dispatch({
    payload,
    type: PUSH_OPEN_FAMILY_TAB,
  });

export const setOpenFamilyTabs = payload => (dispatch, getState) => {
  const { accountAddress, network } = getState().settings;
  const { openFamilyTabs } = getState().openStateSettings;
  const updatedFamilyTabs = {
    ...openFamilyTabs,
    [payload.index]: payload.state,
  };
  saveOpenFamilies(updatedFamilyTabs, accountAddress, network);
  dispatch({
    payload: updatedFamilyTabs,
    type: SET_OPEN_FAMILY_TABS,
  });
};

export const setOpenInvestmentCards = payload => (dispatch, getState) => {
  const { accountAddress, network } = getState().settings;
  saveOpenInvestmentCards(payload, accountAddress, network);
  dispatch({
    payload,
    type: SET_OPEN_INVESTMENT_CARDS,
  });
};

export const resetOpenStateSettings = () => dispatch =>
  dispatch({
    type: CLEAR_OPEN_STATE_SETTINGS,
  });

// -- Reducer --------------------------------------------------------------- //
export const INITIAL_STATE = {
  openFamilyTabs: {},
  openInvestmentCards: {},
  openLPBonus: false,
  openSavings: true,
  openSmallBalances: false,
  openTreasuryBank: true,
};

export default (state = INITIAL_STATE, action) =>
  produce(state, draft => {
    if (action.type === OPEN_STATE_SETTINGS_LOAD_SUCCESS) {
      draft.openFamilyTabs = action.payload.openFamilyTabs;
      draft.openInvestmentCards = action.payload.openInvestmentCards;
      draft.openSavings = action.payload.openSavings;
      draft.openTreasuryBank = action.payload.openTreasuryBank;
      draft.openLPBonus = action.payload.openLPBonus;
      draft.openSmallBalances = action.payload.openSmallBalances;
    } else if (action.type === SET_OPEN_FAMILY_TABS) {
      draft.openFamilyTabs = action.payload;
    } else if (action.type === PUSH_OPEN_FAMILY_TAB) {
      draft.openFamilyTabs = action.payload;
    } else if (action.type === SET_OPEN_SAVINGS) {
      draft.openSavings = action.payload;
    } else if (action.type === SET_OPEN_TREASURY_BANK) {
      draft.openTreasuryBank = action.payload;
    } else if (action.type === SET_OPEN_TOKEN_MIGRATION) {
      draft.openLPBonus = action.payload;
    } else if (action.type === SET_OPEN_SMALL_BALANCES) {
      draft.openSmallBalances = action.payload;
    } else if (action.type === SET_OPEN_INVESTMENT_CARDS) {
      draft.openInvestmentCards = action.payload;
    } else if (action.type === CLEAR_OPEN_STATE_SETTINGS) {
      return INITIAL_STATE;
    }
  });
