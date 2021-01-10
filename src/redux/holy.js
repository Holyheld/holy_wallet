import produce from 'immer';

// -- Constants ------------------------------------------------------------- //
const HOLY_CLEAR_STATE = 'holy/HOLY_CLEAR_STATE';
const HOLY_UPDATE_SAVINGS = 'holy/HOLY_UPDATE_SAVINGS';

// -- Actions --------------------------------------------------------------- //

export const holyUpdateSavings = savings => dispatch => {
  dispatch({
    payload: savings,
    type: HOLY_UPDATE_SAVINGS,
  });
};

export const holySavingsRefreshState = () => async dispatch => {
  // request to smart contract here
  const savings = [
    {
      apy: '1.555',
      balance: '10',
      native: {
        price: {
          amount: '1',
        },
      },
      underlying: {
        address: '0x6b175474e89094c44da98b954eedeac495271d1f', // TODO: real address
        symbol: 'yUSD',
      },
    },
    {
      apy: '2.95',
      balance: '22',
      native: {
        price: {
          amount: '1',
        },
      },
      underlying: {
        address: '0x6b175474e89094c44da98b954eedeac495271d2f', // TODO: real address
        symbol: 'yCRV',
      },
    },
    {
      apy: '10',
      balance: '33',
      native: {
        price: {
          amount: '1',
        },
      },
      underlying: {
        address: '0x6b175474e89094c44da98b954eedeac495271d3f', // TODO: real address
        symbol: '3CRV',
      },
    },
  ];

  dispatch(holyUpdateSavings(savings));
};

// -- Reducer --------------------------------------------------------------- //
export const INITIAL_HOLY_STATE = {
  savingsTokens: [
    {
      apy: '1.555',
      balance: '0',
      native: {
        price: {
          amount: '0',
        },
      },
      underlying: {
        address: '0x6b175474e89094c44da98b954eedeac495271d1f', // TODO: real address
        symbol: 'yUSD',
      },
    },
    {
      apy: '2.95',
      balance: '0',
      native: {
        price: {
          amount: '0',
        },
      },
      underlying: {
        address: '0x6b175474e89094c44da98b954eedeac495271d2f', // TODO: real address
        symbol: 'yCRV',
      },
    },
    {
      apy: '10',
      balance: '0',
      native: {
        price: {
          amount: '0',
        },
      },
      underlying: {
        address: '0x6b175474e89094c44da98b954eedeac495271d3f', // TODO: real address
        symbol: '3CRV',
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
      default:
        break;
    }
  });
