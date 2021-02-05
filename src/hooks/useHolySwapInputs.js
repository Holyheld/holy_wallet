import { get } from 'lodash';
import { useCallback, useState } from 'react';
import { getTransferData } from '../handlers/holy';
import {
  convertAmountFromNativeValue,
  convertAmountToNativeAmount,
  convertAmountToRawAmount,
  convertRawAmountToDecimalFormat,
  greaterThanOrEqualTo,
  isZero,
} from '../helpers/utilities';
import { useAccountSettings } from '.';
import logger from 'logger';

export default function useHolySwapInputs({
  inputCurrency,
  outputCurrency,
  maxInputBalance,
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [isMax, setIsMax] = useState(false);
  const [inputAmount, setInputAmount] = useState(null);
  const [isSufficientBalance, setIsSufficientBalance] = useState(true);
  const [isSufficientLiquidity, setIsSufficientLiquidity] = useState(true);
  const [transferError, setTransferError] = useState(null);
  const [transferData, setTransferData] = useState(null);

  const [nativeAmount, setNativeAmount] = useState(null);
  const [outputAmount, setOutputAmount] = useState(null);

  const { network } = useAccountSettings();

  const updateInputAmount = useCallback(
    async (newInputAmount, newIsMax = false) => {
      logger.log('updateInputAmount');
      setIsLoading(true);
      setInputAmount(newInputAmount);
      setIsMax(!!newInputAmount && newIsMax);

      if (inputCurrency && outputCurrency) {
        logger.log('inputCurrency:', inputCurrency);
        logger.log('outputCurrency:', outputCurrency);
        logger.log('newInputAmount:', newInputAmount);

        const newIsSufficientBalance =
          !newInputAmount ||
          greaterThanOrEqualTo(maxInputBalance, newInputAmount);
        setIsSufficientBalance(newIsSufficientBalance);

        const isInputZero = isZero(newInputAmount);

        if (newInputAmount && !isInputZero) {
          const newNativePrice = get(
            inputCurrency,
            'native.price.amount',
            null
          );

          const newNativeAmount = convertAmountToNativeAmount(
            newInputAmount,
            newNativePrice
          );
          setNativeAmount(newNativeAmount);

          const amountInWEI = convertAmountToRawAmount(
            newInputAmount,
            inputCurrency.decimals
          );
          logger.log('amountInWEI:', amountInWEI);

          setTransferError(null);
          const transferData = await getTransferData(
            outputCurrency.address,
            inputCurrency.address,
            amountInWEI,
            true,
            network
          );

          if (transferData.data && !transferData.error) {
            const newOutputAmount = convertRawAmountToDecimalFormat(
              transferData.buyAmount,
              outputCurrency.decimals
            );
            setTransferData(transferData);
            setOutputAmount(newOutputAmount);
            setIsSufficientLiquidity(true);
          } else {
            if ('INSUFFICIENT_ASSET_LIQUIDITY' === transferData.error) {
              setIsSufficientLiquidity(false);
            } else {
              setTransferError(transferData.error);
            }
          }
        } else {
          setNativeAmount(0);
          setOutputAmount(0);
          setIsSufficientLiquidity(true);
        }
      }
      setIsLoading(false);
    },
    [inputCurrency, maxInputBalance, network, outputCurrency]
  );

  const updateNativeAmount = useCallback(
    async newNativeAmount => {
      setIsLoading(true);

      setNativeAmount(newNativeAmount);
      setIsMax(false);

      if (inputCurrency && outputCurrency) {
        logger.log('inputCurrency:', inputCurrency);
        logger.log('outputCurrency:', outputCurrency);
        logger.log('newNativeAmount:', newNativeAmount);

        if (newNativeAmount && !isZero(newNativeAmount)) {
          const nativePrice = get(inputCurrency, 'native.price.amount', null);
          const newInputAmount = convertAmountFromNativeValue(
            newNativeAmount,
            nativePrice,
            inputCurrency.decimals
          );

          setInputAmount(newInputAmount);

          const newIsSufficientBalance =
            !newInputAmount ||
            greaterThanOrEqualTo(maxInputBalance, newInputAmount);
          setIsSufficientBalance(newIsSufficientBalance);

          const amountInWEI = convertAmountToRawAmount(
            newInputAmount,
            inputCurrency.decimals
          );
          logger.log('amountInWEI:', amountInWEI);

          setTransferError(null);
          const transferData = await getTransferData(
            outputCurrency.address,
            inputCurrency.address,
            amountInWEI,
            true,
            network
          );

          if (transferData.data && !transferData.error) {
            const newOutputAmount = convertRawAmountToDecimalFormat(
              transferData.buyAmount,
              outputCurrency.decimals
            );
            setTransferData(transferData);
            setOutputAmount(newOutputAmount);
            setIsSufficientLiquidity(true);
          } else {
            if ('INSUFFICIENT_ASSET_LIQUIDITY' === transferData.error) {
              setIsSufficientLiquidity(false);
            } else {
              setTransferError(transferData.error);
            }
          }
        } else {
          setInputAmount(0);
          setOutputAmount(0);
          setIsSufficientLiquidity(true);
        }
      }

      setIsLoading(false);
    },
    [inputCurrency, maxInputBalance, network, outputCurrency]
  );

  const updateOutputAmount = useCallback(
    async newOutputAmount => {
      setIsLoading(true);

      setOutputAmount(newOutputAmount);
      setIsMax(false);

      if (inputCurrency && outputCurrency) {
        logger.log('inputCurrency:', inputCurrency);
        logger.log('outputCurrency:', outputCurrency);
        logger.log('newOutputAmount:', newOutputAmount);

        if (newOutputAmount && !isZero(newOutputAmount)) {
          const outputAmountInWEI = convertAmountToRawAmount(
            newOutputAmount,
            outputCurrency.decimals
          );
          logger.log('outputAmountInWEI:', outputAmountInWEI);

          setTransferError(null);
          const transferData = await getTransferData(
            outputCurrency.address,
            inputCurrency.address,
            outputAmountInWEI,
            false,
            network
          );

          if (transferData.data && !transferData.error) {
            const newInputAmount = convertRawAmountToDecimalFormat(
              transferData.sellAmount,
              inputCurrency.decimals
            );
            setTransferData(transferData);
            setInputAmount(newInputAmount);

            const newNativePrice = get(
              inputCurrency,
              'native.price.amount',
              null
            );
            const newNativeAmount = convertAmountToNativeAmount(
              newInputAmount,
              newNativePrice
            );
            setNativeAmount(newNativeAmount);

            const newIsSufficientBalance =
              !newInputAmount ||
              greaterThanOrEqualTo(maxInputBalance, newInputAmount);
            setIsSufficientBalance(newIsSufficientBalance);
          } else {
            if ('INSUFFICIENT_ASSET_LIQUIDITY' === transferData.error) {
              setIsSufficientLiquidity(false);
            } else {
              setTransferError(transferData.error);
            }
          }
        } else {
          setInputAmount(0);
          setOutputAmount(0);
          setIsSufficientLiquidity(true);
        }
      }

      setIsLoading(false);
    },
    [inputCurrency, maxInputBalance, network, outputCurrency]
  );

  return {
    inputAmount,
    isLoading,
    isMax,
    isSufficientBalance,
    isSufficientLiquidity,
    nativeAmount,
    outputAmount,
    setIsSufficientBalance,
    transferData,
    transferError,
    updateInputAmount,
    updateNativeAmount,
    updateOutputAmount,
  };
}
