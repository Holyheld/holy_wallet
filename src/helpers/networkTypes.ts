export enum Network {
  binance = 'binance',
  goerli = 'goerli',
  kovan = 'kovan',
  mainnet = 'mainnet',
  matic = 'matic',
  rinkeby = 'rinkeby',
  ropsten = 'ropsten',
}

// We need to keep this one until
// we have typescript everywhere
export default {
  binance: 'binance' as Network,
  goerli: 'goerli' as Network,
  kovan: 'kovan' as Network,
  mainnet: 'mainnet' as Network,
  matic: 'matic' as Network,
  rinkeby: 'rinkeby' as Network,
  ropsten: 'ropsten' as Network,
};
