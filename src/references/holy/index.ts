import networkTypes, { Network } from '../../helpers/networkTypes';
import HOLY_HAND_ABI from './holy-hand.json';
import HOLY_PASSAGE_ABI from './holy-passage.json';
import HOLY_POOL_ABI from './holy-pool.json';
import HOLY_VISOR_ABI from './holy-visor.json';

// TODO: add mainnet addresses
const HOLY_ADDRESSES = {
  [networkTypes.mainnet]: {
    HH_V2_ADDRESS: '0x3FA729B4548beCBAd4EaB6EF18413470e6D5324C',
    HOLY_HAND_ADDRESS: '0x1eF7A557cfA8436ee08790e3F2b190b8937fDa0E',
    HOLY_PASSAGE_ADDRESS: '0x39ac24FD08991B1d69A9ef7189Bc718C988fF5B3',
    HOLY_SAVINGS_POOL_ADDRESS: '0xAF985437DCA19DEFf89e61F83Cd526b272523719',
    HOLY_V1_ADDRESS: '0x39eae99e685906ff1c11a962a743440d0a1a6e09',
    HOLY_VISOR_ADDRESS: '0x636356f857f89AF15Cb67735b68B9b673b5Cda6c',
    SUSHISWAP_HH_WETH_POOL_ADDRESS:
      '0x87b918e76c92818DB0c76a4E174447aeE6E6D23f',
    UNISWAP_HOLY_WETH_POOL_ADDRESS:
      '0xb6c8e5f00117136571d260bfb1baff62ddfd9960',
    USDC_TOKEN_ADDRESS: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    WETH_TOKEN_ADDRESS: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  },
  [networkTypes.ropsten]: {
    HH_V2_ADDRESS: '0x3B055b3c00E8e27bB84a1E98391443Bff4049129',
    HOLY_HAND_ADDRESS: '0x1',
    HOLY_PASSAGE_ADDRESS: '0xf413F5b36C3c9C121d2b66858382F0368678CAc1',
    HOLY_SAVINGS_POOL_ADDRESS: '0x39e0Efd667c5760ec98F105eEAd8F8a77d608108',
    HOLY_V1_ADDRESS: '0xe211f0268797Fe96c91247fBF5ea7A902876818E',
    HOLY_VISOR_ADDRESS: '0x5c2508fd52DA2AB53361BD24B374bE35ed8cdCF0',
    SUSHISWAP_HH_WETH_POOL_ADDRESS:
      '0x87b918e76c92818DB0c76a4E174447aeE6E6D23f',
    UNISWAP_HOLY_WETH_POOL_ADDRESS:
      '0xb6c8e5f00117136571d260bfb1baff62ddfd9960',
    USDC_TOKEN_ADDRESS: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    WETH_TOKEN_ADDRESS: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  },
  [networkTypes.kovan]: {
    HH_V2_ADDRESS: '0x1',
    HOLY_HAND_ADDRESS: '0xD0f4aCf42F0AfD228544B7D0f4f8265C2997791d',
    HOLY_PASSAGE_ADDRESS: '0x1',
    HOLY_SAVINGS_POOL_ADDRESS: '0x39e0Efd667c5760ec98F105eEAd8F8a77d608108',
    HOLY_V1_ADDRESS: '0x1',
    HOLY_VISOR_ADDRESS: '0x1',
    SUSHISWAP_HH_WETH_POOL_ADDRESS: '0x1',
    UNISWAP_HOLY_WETH_POOL_ADDRESS: '0x1',
    USDC_TOKEN_ADDRESS: '0x75b0622cec14130172eae9cf166b92e5c112faff',
    WETH_TOKEN_ADDRESS: '0x1',
  },
  [networkTypes.rinkeby]: {
    HH_V2_ADDRESS: '0x1',
    HOLY_HAND_ADDRESS: '0x1',
    HOLY_PASSAGE_ADDRESS: '0x1',
    HOLY_SAVINGS_POOL_ADDRESS: '0x39e0Efd667c5760ec98F105eEAd8F8a77d608108',
    HOLY_V1_ADDRESS: '0x1',
    HOLY_VISOR_ADDRESS: '0x1',
    SUSHISWAP_HH_WETH_POOL_ADDRESS: '0x1',
    UNISWAP_HOLY_WETH_POOL_ADDRESS: '0x1',
    USDC_TOKEN_ADDRESS: '0xb6c8e5f00117136571d260bfb1baff62ddfd9960',
    WETH_TOKEN_ADDRESS: '0x1',
  },
  [networkTypes.goerli]: {
    HH_V2_ADDRESS: '0x1',
    HOLY_HAND_ADDRESS: '0x1',
    HOLY_PASSAGE_ADDRESS: '0x1',
    HOLY_SAVINGS_POOL_ADDRESS: '0x39e0Efd667c5760ec98F105eEAd8F8a77d608108',
    HOLY_V1_ADDRESS: '0x1',
    HOLY_VISOR_ADDRESS: '0x1',
    SUSHISWAP_HH_WETH_POOL_ADDRESS: '0x1',
    UNISWAP_HOLY_WETH_POOL_ADDRESS: '0x1',
    USDC_TOKEN_ADDRESS: '0xb6c8e5f00117136571d260bfb1baff62ddfd9960',
    WETH_TOKEN_ADDRESS: '0x1',
  },
  [networkTypes.matic]: {
    HH_V2_ADDRESS: '0x521CddC0CBa84F14c69C1E99249F781AA73Ee0BC',
    HOLY_HAND_ADDRESS: '0x1',
    HOLY_PASSAGE_ADDRESS: '0x1',
    HOLY_SAVINGS_POOL_ADDRESS: '0x1',
    HOLY_V1_ADDRESS: '0x1',
    HOLY_VISOR_ADDRESS: '0x1',
    SUSHISWAP_HH_WETH_POOL_ADDRESS: '0x1',
    UNISWAP_HOLY_WETH_POOL_ADDRESS: '0x1',
    USDC_TOKEN_ADDRESS: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
    WETH_TOKEN_ADDRESS: '0xAe740d42E4ff0C5086b2b5b5d149eB2F9e1A754F',
  },
  [networkTypes.binance]: {
    HH_V2_ADDRESS: '0x',
    HOLY_HAND_ADDRESS: '0x1',
    HOLY_PASSAGE_ADDRESS: '0x1',
    HOLY_SAVINGS_POOL_ADDRESS: '0x1',
    HOLY_V1_ADDRESS: '0x1',
    HOLY_VISOR_ADDRESS: '0x1',
    SUSHISWAP_HH_WETH_POOL_ADDRESS: '0x1',
    UNISWAP_HOLY_WETH_POOL_ADDRESS: '0x1',
    USDC_TOKEN_ADDRESS: '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d',
    WETH_TOKEN_ADDRESS: '0x2170ed0880ac9a755fd29b2688956bd959f933f8',
  },
};

const USDC_TOKEN_ADDRESS = (network: Network) => {
  return HOLY_ADDRESSES[network].USDC_TOKEN_ADDRESS
    ? HOLY_ADDRESSES[network].USDC_TOKEN_ADDRESS
    : '0x1';
};
const WETH_TOKEN_ADDRESS = (network: Network) => {
  return HOLY_ADDRESSES[network].WETH_TOKEN_ADDRESS
    ? HOLY_ADDRESSES[network].WETH_TOKEN_ADDRESS
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

const HOLY_SAVINGS_POOL_ADDRESS = (network: Network): string => {
  return HOLY_ADDRESSES[network].HOLY_SAVINGS_POOL_ADDRESS
    ? HOLY_ADDRESSES[network].HOLY_SAVINGS_POOL_ADDRESS
    : '0x1';
};

const HOLY_HAND_ADDRESS = (network: Network): string => {
  return HOLY_ADDRESSES[network].HOLY_HAND_ADDRESS
    ? HOLY_ADDRESSES[network].HOLY_HAND_ADDRESS
    : '0x1';
};

const HOLY_VISOR_ADDRESS = (network: Network): string => {
  return HOLY_ADDRESSES[network].HOLY_VISOR_ADDRESS
    ? HOLY_ADDRESSES[network].HOLY_VISOR_ADDRESS
    : '0x1';
};

const UNISWAP_HOLY_WETH_POOL_ADDRESS = (network: Network): string => {
  return HOLY_ADDRESSES[network].UNISWAP_HOLY_WETH_POOL_ADDRESS
    ? HOLY_ADDRESSES[network].UNISWAP_HOLY_WETH_POOL_ADDRESS
    : '0x1';
};

const SUSHISWAP_HH_WETH_POOL_ADDRESS = (network: Network): string => {
  return HOLY_ADDRESSES[network].SUSHISWAP_HH_WETH_POOL_ADDRESS
    ? HOLY_ADDRESSES[network].SUSHISWAP_HH_WETH_POOL_ADDRESS
    : '0x1';
};

type asset = {
  address: string;
  symbol: string;
  decimals: number;
  name: string;
};

const getHHAsset = (network: Network): asset => {
  return {
    address: HH_V2_ADDRESS(network),
    decimals: 18,
    name: 'Holyheld',
    symbol: 'HH',
  };
};

const getUSDCAsset = (network: Network): asset => {
  return {
    address: USDC_TOKEN_ADDRESS(network),
    decimals: 6,
    name: 'USDC',
    symbol: 'USDC',
  };
};

const getHHWethPoolAsset = (network: Network): asset => {
  return {
    address: SUSHISWAP_HH_WETH_POOL_ADDRESS(network),
    decimals: 18,
    name: 'HH-ETH LP',
    symbol: 'LP',
  };
};

const getWethAsset = (network: Network): asset => {
  return {
    address: WETH_TOKEN_ADDRESS(network),
    decimals: 18,
    name: 'Wrapped ETH',
    symbol: 'WETH',
  };
};

const MAX_HOLY_DEPOSIT_AMOUNT_USDC = '10000';

export {
  HOLY_PASSAGE_ADDRESS,
  HOLY_PASSAGE_ABI,
  HOLY_POOL_ABI,
  HOLY_HAND_ADDRESS,
  HOLY_VISOR_ABI,
  HOLY_HAND_ABI,
  HOLY_SAVINGS_POOL_ADDRESS,
  HOLY_VISOR_ADDRESS,
  HOLY_V1_ADDRESS,
  MAX_HOLY_DEPOSIT_AMOUNT_USDC,
  USDC_TOKEN_ADDRESS,
  SUSHISWAP_HH_WETH_POOL_ADDRESS,
  UNISWAP_HOLY_WETH_POOL_ADDRESS,
  HH_V2_ADDRESS,
  WETH_TOKEN_ADDRESS,
  getHHAsset,
  getUSDCAsset,
  getHHWethPoolAsset,
  getWethAsset,
};
