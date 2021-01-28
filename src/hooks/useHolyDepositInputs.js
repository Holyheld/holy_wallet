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
import logger from 'logger';

export default function useHolyDepositInputs({
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

          const transferData = await getTransferData(
            outputCurrency.symbol,
            inputCurrency.symbol,
            amountInWEI
          );

          if (transferData.data && !transferData.error) {
            const newOutputAmount = convertRawAmountToDecimalFormat(
              transferData.buyAmount,
              outputCurrency.decimals
            );
            setTransferData(transferData);
            setOutputAmount(newOutputAmount);
          } else {
            setTransferError(transferData.error);
            //todo: parse
            setIsSufficientLiquidity(true);
          }
        } else {
          setNativeAmount(0);
          setOutputAmount(0);
        }
      }
      setIsLoading(false);
    },
    [inputCurrency, maxInputBalance, outputCurrency]
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

          const newIsSufficientBalance =
            !newInputAmount ||
            greaterThanOrEqualTo(maxInputBalance, newInputAmount);
          setIsSufficientBalance(newIsSufficientBalance);

          const amountInWEI = convertAmountToRawAmount(
            newInputAmount,
            inputCurrency.decimals
          );
          logger.log('amountInWEI:', amountInWEI);

          const transferData = await getTransferData(
            outputCurrency.symbol,
            inputCurrency.symbol,
            amountInWEI
          );

          if (transferData.data && !transferData.error) {
            const newOutputAmount = convertRawAmountToDecimalFormat(
              transferData.buyAmount,
              outputCurrency.decimals
            );
            setTransferData(transferData);
            setOutputAmount(newOutputAmount);
          } else {
            setTransferError(transferData.error);
            //todo: parse
            setIsSufficientLiquidity(true);
          }
        } else {
          setInputAmount(0);
          setOutputAmount(0);
        }
      }

      setIsLoading(false);
    },
    [inputCurrency, maxInputBalance, outputCurrency]
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
  };
}
