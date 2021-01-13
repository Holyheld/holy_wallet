import { get } from 'lodash';
import { useCallback, useState } from 'react';
import {
  convertAmountFromNativeValue,
  convertAmountToNativeAmount,
  greaterThanOrEqualTo,
  isZero,
} from '../helpers/utilities';
import logger from 'logger';

export default function useHolyDepositInputs({
  inputCurrency,
  maxInputBalance,
}) {
  const [isMax, setIsMax] = useState(false);
  const [inputAmount, setInputAmount] = useState(null);
  const [isSufficientBalance, setIsSufficientBalance] = useState(true);
  const [nativeAmount, setNativeAmount] = useState(null);
  const [outputAmount, setOutputAmount] = useState(null);

  const updateInputAmount = useCallback(
    (newInputAmount, newIsMax = false) => {
      setInputAmount(newInputAmount);
      setIsMax(!!newInputAmount && newIsMax);

      if (inputCurrency) {
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

          const newOutputAmount = newNativeAmount; // Because HOLY savings use USDc

          setNativeAmount(newNativeAmount);
          setOutputAmount(newOutputAmount);
        }
      }
    },
    [inputCurrency, maxInputBalance]
  );

  const updateOutputAmount = useCallback(
    newOutputAmount => {
      setOutputAmount(newOutputAmount);
      if (newOutputAmount && !isZero(newOutputAmount) && inputCurrency) {
        const nativePrice = get(inputCurrency, 'native.price.amount', null);
        const newInputAmount = convertAmountFromNativeValue(
          newOutputAmount,
          nativePrice,
          inputCurrency.decimals
        );

        const newIsSufficientBalance =
          !newInputAmount ||
          greaterThanOrEqualTo(maxInputBalance, newInputAmount);

        setIsSufficientBalance(newIsSufficientBalance);
        setInputAmount(newInputAmount);
      }
    },
    [inputCurrency, maxInputBalance]
  );

  const updateNativeAmount = useCallback(
    nativeAmount => {
      logger.log('update native amount', nativeAmount);

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

      const newOutputAmount = nativeAmount;

      setInputAmount(inputAmount);
      setOutputAmount(newOutputAmount);
    },
    [inputCurrency]
  );

  return {
    inputAmount,
    isMax,
    isSufficientBalance,
    nativeAmount,
    outputAmount,
    setIsSufficientBalance,
    updateInputAmount,
    updateNativeAmount,
    updateOutputAmount,
  };
}
