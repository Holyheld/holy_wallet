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
    nativeAmount => {
      logger.log('update native amount', nativeAmount);
      logger.log('inputCurrency', inputCurrency);

      if (!inputCurrency) return;

      let inputAmount = null;

      setNativeAmount(nativeAmount);
      setIsMax(false);

      if (nativeAmount && !isZero(nativeAmount)) {
        const nativePrice = get(inputCurrency, 'native.price.amount', null);
        inputAmount = convertAmountFromNativeValue(
          nativeAmount,
          nativePrice,
          inputCurrency.decimals
        );
      }

      // TODO: use request to get the proper value
      const newOutputAmount = nativeAmount;

      setInputAmount(inputAmount);
      setOutputAmount(newOutputAmount);
    },
    [inputCurrency]
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
