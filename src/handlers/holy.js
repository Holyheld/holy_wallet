import { Contract } from '@ethersproject/contracts';
import { captureException } from '@sentry/react-native';
import BigNumber from 'bignumber.js';
import networkTypes from '../helpers/networkTypes';
import {
  convertRawAmountToDecimalFormat,
  divide,
  // greaterThan,
  multiply,
} from '../helpers/utilities';
import {
  holyUpdateBonusDPY,
  holyUpdateBonusRate,
  holyUpdateEarlyLPBonusAmount,
  // holyUpdateEarlyLPBonusShow,
  holyUpdateFullCap,
  holyUpdateSavingsAPY,
  holyUpdateSavingsBalanceUCDS,
  updateHHInWETHPrice,
  updateHHNativePrice,
} from '../redux/holy';
import {
  getUSDCAsset,
  HH_V2_ADDRESS,
  HOLY_PASSAGE_ABI,
  HOLY_PASSAGE_ADDRESS,
  HOLY_POOL_ABI,
  HOLY_SAVINGS_POOL_ADDRESS,
  HOLY_VISOR_ABI,
  HOLY_VISOR_ADDRESS,
  SUSHISWAP_HH_WETH_POOL_ADDRESS,
  WETH_TOKEN_ADDRESS,
} from '../references/holy';
import { web3Provider } from './web3';
import { ethereumUtils } from '@holyheld-com/utils';
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
    // dispatch(
    //   holyUpdateEarlyLPBonusShow(greaterThan(amountCap.toString(), '0'))
    // );
  } catch (error) {
    logger.log('error refreshing HOLY bonus amount caps');
    logger.log(error);
    captureException(error);
    dispatch(holyUpdateFullCap('0'));
    // dispatch(holyUpdateEarlyLPBonusShow(false));
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

export const getHHPriceInWETH = async ({ network, accountAddress }) => {
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

    const HHinWETHPrice = divide(uniswapWETHAmount, uniswapHHAmount);
    logger.log('HHinWETHPrice: ', HHinWETHPrice);

    return { HHinWETHPrice };
  } catch (error) {
    logger.log('error getHHPriceInWETH HH price from sushiswap HH-WETH pool');
    logger.log(error);
    throw error;
  }
};

export const refreshHHinWETHPrice = () => async (dispatch, getState) => {
  const { network, accountAddress } = getState().settings;
  try {
    const { HHinWETHPrice } = await getHHPriceInWETH({
      accountAddress,
      network,
    });
    logger.log('refreshHHPrice: HHinWETHPrice: ', HHinWETHPrice);
    dispatch(updateHHInWETHPrice(HHinWETHPrice));
  } catch (error) {
    logger.log('error refreshing HH price');
    logger.log(error);
    dispatch(updateHHInWETHPrice('0'));
  }
};

export const refreshHHNativePrice = () => async (dispatch, getState) => {
  const { assets } = getState().data;
  logger.log('refreshHHNativePrice...');

  const ethNativePrice = ethereumUtils.getEthPriceUnit(assets);
  logger.log('ethNativePrice: ', ethNativePrice);

  const { inEth: HHinWETHPrice } = getState().holy.prices.HH;

  logger.log('refreshHHNativePrice: HHinWETHPrice: ', HHinWETHPrice);
  const HHNativePrice = multiply(HHinWETHPrice, ethNativePrice);
  logger.log('refreshHHNativePrice: HHNativePrice: ', HHNativePrice);
  dispatch(updateHHNativePrice(HHNativePrice));
};

export const calculateHHNativePrice = ethNativePrice => async (
  dispatch,
  getState
) => {
  const { inEth: HHinWETHPrice } = getState().holy.prices.HH.inEth;

  logger.log('calculateHHNativePrice: HHinWETHPrice: ', HHinWETHPrice);
  const HHNativePrice = multiply(HHinWETHPrice, ethNativePrice);
  logger.log('calculateHHNativePrice: HHNativePrice: ', HHNativePrice);
  dispatch(updateHHNativePrice(HHNativePrice));
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

    let holyDPYinWEI = await contractHolyPool.getDailyAPY({
      from: accountAddress,
    });

    holyDPYinWEI = holyDPYinWEI.toString();
    //const holyDPYinWEI = '80100000000000000';

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
  buyTokenAddress,
  sellTokenAddress,
  amount,
  isInputAmount = true,
  network = networkTypes.mainnet
) => {
  let error = '';
  let data = '';
  let buyAmount = '';
  let sellAmount = '';
  let allowanceTarget = '';
  let to = '';
  let value = '';
  try {
    const amountKey = isInputAmount ? 'sellAmount' : 'buyAmount';
    const prefix =
      network === networkTypes.mainnet ? '' : `${network.toString()}.`;

    const r = `https://${prefix}api.0x.org/swap/v1/quote?buyToken=${buyTokenAddress}&sellToken=${sellTokenAddress}&${amountKey}=${amount}`;

    logger.log(r);

    const res = await fetch(r, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      method: 'GET',
    });
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
      buyAmount = json.buyAmount;
      sellAmount = json.sellAmount;

      if (!isInputAmount) {
        // in case of buyAmount we have to executethe second request with proper sellAmount
        // coz 0x has strange behavior in case of buyAmount
        logger.log('Performing a second request with sellAmount...');
        const innerResult = await getTransferData(
          buyTokenAddress,
          sellTokenAddress,
          sellAmount,
          true,
          network
        );
        logger.log('Returning inner result...');
        return innerResult;
      }
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
    sellAmount,
    sellTokenAddress,
    to,
    value,
  };
};

export const refreshHoly = () => async dispatch => {
  dispatch(refreshHolyEarlyLPBonus());
  dispatch(refreshHolySavings());
};
