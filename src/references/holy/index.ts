import networkTypes, { Network } from '../../helpers/networkTypes';
import HOLY_PASSAGE_ABI from './holy-passage.json';

// TODO: add mainnet addresses
const HOLY_ADDRESSES = {
  [networkTypes.mainnet]: {
    HH_V2_ADDRESS: '0x3B055b3c00E8e27bB84a1E98391443Bff4049129',
    HOLY_PASSAGE_ADDRESS: '0x6c183CF22f4E0Ba6Dfa3EbA35Cbf1537B83fbE51',
    HOLY_V1_ADDRESS: '0xe211f0268797Fe96c91247fBF5ea7A902876818E',
    USDC_TOKEN_ADDRESS: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  },
  [networkTypes.ropsten]: {
    HH_V2_ADDRESS: '0x3B055b3c00E8e27bB84a1E98391443Bff4049129',
    HOLY_PASSAGE_ADDRESS: '0x6c183CF22f4E0Ba6Dfa3EbA35Cbf1537B83fbE51',
    HOLY_V1_ADDRESS: '0xe211f0268797Fe96c91247fBF5ea7A902876818E',
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

export {
  HOLY_PASSAGE_ADDRESS,
  HOLY_PASSAGE_ABI,
  HOLY_V1_ADDRESS,
  USDC_TOKEN_ADDRESS,
  HH_V2_ADDRESS,
};
