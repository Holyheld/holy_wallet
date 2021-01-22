import networkTypes, { Network } from '../../helpers/networkTypes';
import HOLY_PASSAGE_ABI from './holy-passage.json';
import HOLY_VISOR_ABI from './holy-visor.json';

// TODO: add mainnet addresses
const HOLY_ADDRESSES = {
  [networkTypes.mainnet]: {
    HH_V2_ADDRESS: '0x3FA729B4548beCBAd4EaB6EF18413470e6D5324C',
    HOLY_PASSAGE_ADDRESS: '0x39ac24FD08991B1d69A9ef7189Bc718C988fF5B3',
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
    HOLY_PASSAGE_ADDRESS: '0xf413F5b36C3c9C121d2b66858382F0368678CAc1',
    HOLY_V1_ADDRESS: '0xe211f0268797Fe96c91247fBF5ea7A902876818E',
    HOLY_VISOR_ADDRESS: '0x5c2508fd52DA2AB53361BD24B374bE35ed8cdCF0',
    SUSHISWAP_HH_WETH_POOL_ADDRESS:
      '0x87b918e76c92818DB0c76a4E174447aeE6E6D23f',
    UNISWAP_HOLY_WETH_POOL_ADDRESS:
      '0xb6c8e5f00117136571d260bfb1baff62ddfd9960',
    USDC_TOKEN_ADDRESS: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    WETH_TOKEN_ADDRESS: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
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
    decimals: 18,
    name: 'USDC',
    symbol: 'USDC',
  };
};

export {
  HOLY_PASSAGE_ADDRESS,
  HOLY_PASSAGE_ABI,
  HOLY_VISOR_ABI,
  HOLY_VISOR_ADDRESS,
  HOLY_V1_ADDRESS,
  USDC_TOKEN_ADDRESS,
  SUSHISWAP_HH_WETH_POOL_ADDRESS,
  UNISWAP_HOLY_WETH_POOL_ADDRESS,
  HH_V2_ADDRESS,
  WETH_TOKEN_ADDRESS,
  getHHAsset,
  getUSDCAsset,
};
