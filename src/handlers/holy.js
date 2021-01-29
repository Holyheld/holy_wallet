import { Contract } from '@ethersproject/contracts';
import { captureException } from '@sentry/react-native';
import BigNumber from 'bignumber.js';
import { get } from 'lodash';
import {
  convertRawAmountToDecimalFormat,
  divide,
  greaterThan,
  multiply,
} from '../helpers/utilities';
import {
  holyUpdateBonusDPY,
  holyUpdateBonusRate,
  holyUpdateEarlyLPBonusAmount,
  holyUpdateEarlyLPBonusShow,
  holyUpdateFullCap,
  holyUpdateSavingsAPY,
  holyUpdateSavingsBalanceUCDS,
  updateHHPrice,
  updateHolyPrice,
} from '../redux/holy';
import {
  getUSDCAsset,
  HH_V2_ADDRESS,
  HOLY_PASSAGE_ABI,
  HOLY_PASSAGE_ADDRESS,
  HOLY_POOL_ABI,
  HOLY_SAVINGS_POOL_ADDRESS,
  HOLY_V1_ADDRESS,
  HOLY_VISOR_ABI,
  HOLY_VISOR_ADDRESS,
  SUSHISWAP_HH_WETH_POOL_ADDRESS,
  UNISWAP_HOLY_WETH_POOL_ADDRESS,
  WETH_TOKEN_ADDRESS,
} from '../references/holy';
import { web3Provider } from './web3';
import logger from 'logger';

const ERC20SimpleABI = [
  // Read-Only Functions
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',

  // Authenticated Functions
  'function transfer(address to, uint amount) returns (boolean)',

  // Events
  'event Transfer(address indexed from, address indexed to, uint amount)',
];

const refreshHolyEarlyLPBonus = () => async (dispatch, getState) => {
  const { network, accountAddress } = getState().settings;
  const contractAddress = HOLY_PASSAGE_ADDRESS(network);
  const contractABI = HOLY_PASSAGE_ABI;

  const holyPassage = new Contract(contractAddress, contractABI, web3Provider);

  try {
    logger.log('refreshing HOLY early LP bonuses');
    let claimableBonus = await holyPassage.getClaimableBonus({
      from: accountAddress,
    });
    logger.log('HOLY bonus rate in WEI: ', claimableBonus);
    claimableBonus = new BigNumber(claimableBonus.toString());
    claimableBonus = claimableBonus
      .dividedBy(new BigNumber(10).pow(new BigNumber(18)))
      .toFixed();
    logger.log('HOLY claimable bonuses: ', claimableBonus);

    dispatch(holyUpdateEarlyLPBonusAmount(claimableBonus.toString()));
  } catch (error) {
    logger.log('error refreshing HOLY early LP bonuses');
    logger.log(error);
    captureException(error);
    dispatch(holyUpdateEarlyLPBonusAmount('0'));
  }

  const visorAddress = HOLY_VISOR_ADDRESS(network);
  const visorABI = HOLY_VISOR_ABI;

  const holyVisor = new Contract(visorAddress, visorABI, web3Provider);

  try {
    logger.log('refreshing HOLY bonus rate');
    let bonusRate = await holyVisor.bonusMultipliers(accountAddress, {
      from: accountAddress,
    });
    logger.log('HOLY bonus rate in WEI: ', bonusRate);
    bonusRate = new BigNumber(bonusRate.toString());
    bonusRate = bonusRate.dividedBy(new BigNumber(10).pow(new BigNumber(18)));
    logger.log('HOLY bonus rate: ', bonusRate);
    dispatch(holyUpdateBonusRate(bonusRate.toString()));
  } catch (error) {
    logger.log('error refreshing HOLY bonus rate');
    logger.log(error);
    captureException(error);
    dispatch(holyUpdateBonusRate('1'));
  }

  try {
    logger.log('refreshing HOLY amount caps');
    let amountCap = await holyVisor.bonusAmountCaps(accountAddress, {
      from: accountAddress,
    });
    logger.log('HOLY amount caps: ', amountCap);
    amountCap = new BigNumber(amountCap.toString());
    amountCap = amountCap.dividedBy(new BigNumber(10).pow(new BigNumber(18)));
    logger.log('HOLY amount caps: ', amountCap);
    //dispatch(holyUpdateFullCap('500'));
    dispatch(holyUpdateFullCap(amountCap.toString()));
    dispatch(
      holyUpdateEarlyLPBonusShow(greaterThan(amountCap.toString(), '0'))
    );
  } catch (error) {
    logger.log('error refreshing HOLY bonus amount caps');
    logger.log(error);
    captureException(error);
    dispatch(holyUpdateFullCap('0'));
    dispatch(holyUpdateEarlyLPBonusShow(false));
  }

  try {
    logger.log('refreshing HOLY bonus DPY');
    let dpy = await holyVisor.getDPY({
      from: accountAddress,
    });
    logger.log('HOLY bonus DPY: ', dpy);
    dpy = new BigNumber(dpy.toString());
    dpy = dpy.dividedBy(new BigNumber(10).pow(new BigNumber(18)));
    logger.log('HOLY bonus DPY: ', dpy);
    //dispatch(holyUpdateBonusDPY('16'));
    dispatch(holyUpdateBonusDPY(dpy.toString()));
  } catch (error) {
    logger.log('error refreshing HOLY bonus dpy');
    logger.log(error);
    captureException(error);
    dispatch(holyUpdateBonusDPY('0'));
  }
};

export const refreshHHPrice = () => async (dispatch, getState) => {
  const { network, accountAddress } = getState().settings;

  const contractAddressHH = HH_V2_ADDRESS(network);
  const contractAddressWETH = WETH_TOKEN_ADDRESS(network);

  const contractSushiswapHHWETHPoolAddress = SUSHISWAP_HH_WETH_POOL_ADDRESS(
    network
  );

  const contractHH = new Contract(
    contractAddressHH,
    ERC20SimpleABI,
    web3Provider
  );

  const contractWETH = new Contract(
    contractAddressWETH,
    ERC20SimpleABI,
    web3Provider
  );

  try {
    logger.log('refreshing HH price');
    let uniswapHHAmount = await contractHH.balanceOf(
      contractSushiswapHHWETHPoolAddress,
      {
        from: accountAddress,
      }
    );
    uniswapHHAmount = uniswapHHAmount.toString();
    logger.log('sushiswapHHAmount: ', uniswapHHAmount);
    let uniswapWETHAmount = await contractWETH.balanceOf(
      contractSushiswapHHWETHPoolAddress,
      {
        from: accountAddress,
      }
    );
    uniswapWETHAmount = uniswapWETHAmount.toString();
    logger.log('sushiswapWETHAmount: ', uniswapWETHAmount);

    const { eth } = getState().data.genericAssets;

    const ethNativePrice = String(get(eth, 'price.value', 0));
    logger.log('ethNativePrice: ', ethNativePrice);

    const HHinWETHPrice = divide(uniswapWETHAmount, uniswapHHAmount);
    logger.log('HHinWETHPrice: ', HHinWETHPrice);

    const HHNativePrice = multiply(HHinWETHPrice, ethNativePrice);
    logger.log('HHNativePrice: ', HHNativePrice);
    dispatch(updateHHPrice(HHNativePrice, HHinWETHPrice));
  } catch (error) {
    logger.log('error refreshing HH price from sushiswap HH-WETH pool');
    logger.log(error);
    dispatch(updateHHPrice('0', '0'));
  }
};

export const refreshHolyPrice = () => async (dispatch, getState) => {
  const { network, accountAddress } = getState().settings;

  const contractAddressHoly = HOLY_V1_ADDRESS(network);
  const contractAddressWETH = WETH_TOKEN_ADDRESS(network);

  const contractUniswapHolyWETHPoolAddress = UNISWAP_HOLY_WETH_POOL_ADDRESS(
    network
  );

  const contractHH = new Contract(
    contractAddressHoly,
    ERC20SimpleABI,
    web3Provider
  );

  const contractWETH = new Contract(
    contractAddressWETH,
    ERC20SimpleABI,
    web3Provider
  );

  try {
    logger.log('refreshing Holy price');
    let uniswapHolyAmount = await contractHH.balanceOf(
      contractUniswapHolyWETHPoolAddress,
      {
        from: accountAddress,
      }
    );
    uniswapHolyAmount = uniswapHolyAmount.toString();
    logger.log('uniswapHolyAmount: ', uniswapHolyAmount);
    let uniswapWETHAmount = await contractWETH.balanceOf(
      contractUniswapHolyWETHPoolAddress,
      {
        from: accountAddress,
      }
    );
    uniswapWETHAmount = uniswapWETHAmount.toString();
    logger.log('uniswapWETHAmount: ', uniswapWETHAmount);

    const { eth } = getState().data.genericAssets;

    const ethNativePrice = String(get(eth, 'price.value', 0));
    logger.log('ethNativePrice: ', ethNativePrice);

    const HolyinWETHPrice = divide(uniswapWETHAmount, uniswapHolyAmount);
    logger.log('HolyinWETHPrice: ', HolyinWETHPrice);

    const HolyNativePrice = multiply(HolyinWETHPrice, ethNativePrice);
    logger.log('HolyNativePrice: ', HolyNativePrice);

    dispatch(updateHolyPrice(HolyNativePrice, HolyinWETHPrice));
  } catch (error) {
    logger.log('error refreshing HOLY price from uniswap HOLY-WETH pool');
    logger.log(error);
    dispatch(updateHolyPrice('0', '0'));
  }
};

export const refreshHolySavings = () => async (dispatch, getState) => {
  logger.log('refreshing Holy Savings');

  const { network, accountAddress } = getState().settings;

  const poolCurrency = getUSDCAsset(network);

  const poolAdress = HOLY_SAVINGS_POOL_ADDRESS(network);

  const contractHolyPool = new Contract(
    poolAdress,
    HOLY_POOL_ABI,
    web3Provider
  );

  try {
    logger.log('refreshing Holy Savings balance');
    let holySavingsAmountInWEI = await contractHolyPool.getDepositBalance(
      accountAddress,
      {
        from: accountAddress,
      }
    );

    holySavingsAmountInWEI = holySavingsAmountInWEI.toString();
    logger.log('holySavingsAmountInWEI: ', holySavingsAmountInWEI);
    const holySavingsAmount = convertRawAmountToDecimalFormat(
      holySavingsAmountInWEI,
      poolCurrency.decimals
    );
    logger.log('holySavingsAmount: ', holySavingsAmount);
    dispatch(holyUpdateSavingsBalanceUCDS(holySavingsAmount));

    // let holyDPYinWEI = await contractHolyPool.getAPYDaily(accountAddress, {
    //   from: accountAddress,
    // });

    // holyDPYinWEI = holyDPYinWEI.toString();
    const holyDPYinWEI = '80100000000000000';

    logger.log('holyDPYinWEI: ', holyDPYinWEI);
    const holyDPY = convertRawAmountToDecimalFormat(holyDPYinWEI, 18);
    logger.log('holyDPY: ', holyDPY);
    const holyAPY = multiply(holyDPY, 31 * 12);
    logger.log('holyAPY: ', holyAPY);
    dispatch(holyUpdateSavingsAPY({ apy: holyAPY, dpy: holyDPY }));
  } catch (error) {
    logger.log('error refreshing Holy Savings');
    logger.log(error);
  }
};

export const getTransferData = async (
  buyTokenSymbol,
  sellTokenSymbol,
  amount
) => {
  let error = '';
  let data = '';
  let buyTokenAddress = '';
  let buyAmount = '';
  let allowanceTarget = '';
  let sellTokenAddress = '';
  let to = '';
  let value = '';
  try {
    const res = await fetch(
      `https://kovan.api.0x.org/swap/v1/quote?buyToken=${buyTokenSymbol}&sellToken=${sellTokenSymbol}&sellAmount=${amount}`,
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        method: 'GET',
      }
    );
    logger.log(res);
    let json = await res.json();
    logger.log(json);

    if (json.validationErrors && json.validationErrors.length > 0) {
      error = json.validationErrors[0].reason;
    } else {
      data = json.data;
      allowanceTarget = json.allowanceTarget;
      to = json.to;
      value = json.value;
      buyTokenAddress = json.buyTokenAddress;
      sellTokenAddress = json.sellTokenAddress;
      buyAmount = json.buyAmount;
    }
  } catch (err) {
    logger.warn(`Error during 0x api call: ${err}`);
    error = 'Error';
  }

  return {
    allowanceTarget,
    buyAmount,
    buyTokenAddress,
    data,
    error,
    sellTokenAddress,
    to,
    value,
  };
};

export const refreshHoly = () => async dispatch => {
  dispatch(refreshHolyEarlyLPBonus());
  dispatch(refreshHolyPrice());
  dispatch(refreshHHPrice());
  dispatch(refreshHolySavings());
};
