import { get } from 'lodash';
import { useCallback, useState } from 'react';
import {
  convertAmountFromNativeValue,
  convertAmountToNativeAmount,
  greaterThanOrEqualTo,
  isZero,
} from '../helpers/utilities';

export default function useHolyWithdrawInputs({
  maxInputBalance,
  inputCurrency,
}) {
  const [isMax, setIsMax] = useState(false);
  const [isSufficientBalance, setIsSufficientBalance] = useState(true);

  const [inputAmount, setInputAmount] = useState(null);
  const [outputAmount, setOutputAmount] = useState(null);
  const [nativeAmount, setNativeAmount] = useState(null);

  const updateInputAmount = useCallback(
    (newInputAmount, newIsMax = false) => {
      setInputAmount(newInputAmount);
      setIsMax(!!newInputAmount && newIsMax);

      const newOutputAmount = newInputAmount; // USDc for both cases
      const newIsSufficientBalance =
        !newInputAmount ||
        greaterThanOrEqualTo(maxInputBalance, newInputAmount);

      setIsSufficientBalance(newIsSufficientBalance);
      setOutputAmount(newOutputAmount);

      if (newInputAmount && !isZero(newInputAmount)) {
        const newNativePrice = get(inputCurrency, 'native.price.amount', null);
        const newNativeAmount = convertAmountToNativeAmount(
          newInputAmount,
          newNativePrice
        );

        setNativeAmount(newNativeAmount);
      }
    },
    [maxInputBalance, inputCurrency]
  );

  const updateOutputAmount = useCallback(
    newOutputAmount => {
      setOutputAmount(newOutputAmount);

      const newInputAmount = newOutputAmount;
      const newIsSufficientBalance =
        !newInputAmount ||
        greaterThanOrEqualTo(maxInputBalance, newInputAmount);

      setIsSufficientBalance(newIsSufficientBalance);
      setInputAmount(newInputAmount);
    },
    [maxInputBalance]
  );

  const updateNativeAmount = useCallback(
    nativeAmount => {
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

        const newIsSufficientBalance =
          !inputAmount || greaterThanOrEqualTo(maxInputBalance, inputAmount);

        setIsSufficientBalance(newIsSufficientBalance);

        setInputAmount(inputAmount);
        setOutputAmount(inputAmount);
      } else {
        setInputAmount(inputAmount);
        setOutputAmount(inputAmount);
      }
    },
    [inputCurrency, maxInputBalance]
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
