import networkTypes, { Network } from '../../helpers/networkTypes';
import HOLY_PASSAGE_ABI from './holy-passage.json';
import HOLY_VISOR_ABI from './holy-visor.json';

// TODO: add mainnet addresses
const HOLY_ADDRESSES = {
  [networkTypes.mainnet]: {
    HH_V2_ADDRESS: '0x1faC81aF4DDE6276e5E3283Ff2B0Bd9970B8e755',
    HOLY_PASSAGE_ADDRESS: '0xBb2390d791850D976C87DBBAda1D9992c9B123AD',
    HOLY_V1_ADDRESS: '0x39eae99e685906ff1c11a962a743440d0a1a6e09',
    HOLY_VISOR_ADDRESS: '0x6Ad299B9bD8312F47B132257A95842bA3C1c48B4',
    USDC_TOKEN_ADDRESS: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  },
  [networkTypes.ropsten]: {
    HH_V2_ADDRESS: '0x3B055b3c00E8e27bB84a1E98391443Bff4049129',
    HOLY_PASSAGE_ADDRESS: '0xf413F5b36C3c9C121d2b66858382F0368678CAc1',
    HOLY_V1_ADDRESS: '0xe211f0268797Fe96c91247fBF5ea7A902876818E',
    HOLY_VISOR_ADDRESS: '0x5c2508fd52DA2AB53361BD24B374bE35ed8cdCF0',
    USDC_TOKEN_ADDRESS: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  },
};

const USDC_TOKEN_ADDRESS = (network: Network) => {
  return HOLY_ADDRESSES[network].USDC_TOKEN_ADDRESS
    ? HOLY_ADDRESSES[network].USDC_TOKEN_ADDRESS
    : '0x1';
};
const HOLY_V1_ADDRESS = (network: Network): string => {
  return HOLY_ADDRESSES[network].HOLY_V1_ADDRESS
    ? HOLY_ADDRESSES[network].HOLY_V1_ADDRESS
    : '0x1';
};
const HH_V2_ADDRESS = (network: Network): string => {
  return HOLY_ADDRESSES[network].HH_V2_ADDRESS
    ? HOLY_ADDRESSES[network].HH_V2_ADDRESS
    : '0x1';
};
const HOLY_PASSAGE_ADDRESS = (network: Network): string => {
  return HOLY_ADDRESSES[network].HOLY_PASSAGE_ADDRESS
    ? HOLY_ADDRESSES[network].HOLY_PASSAGE_ADDRESS
    : '0x1';
};

const HOLY_VISOR_ADDRESS = (network: Network): string => {
  return HOLY_ADDRESSES[network].HOLY_VISOR_ADDRESS
    ? HOLY_ADDRESSES[network].HOLY_VISOR_ADDRESS
    : '0x1';
};

export {
  HOLY_PASSAGE_ADDRESS,
  HOLY_PASSAGE_ABI,
  HOLY_VISOR_ABI,
  HOLY_VISOR_ADDRESS,
  HOLY_V1_ADDRESS,
  USDC_TOKEN_ADDRESS,
  HH_V2_ADDRESS,
};
