import { useCallback, useState } from 'react';
import { greaterThanOrEqualTo } from '../helpers/utilities';

export default function useHolyWithdrawInputs({
  inputSaving,
  maxInputBalance,
}) {
  const [isMax, setIsMax] = useState(false);
  const [inputAmount, setInputAmount] = useState(null);
  const [isSufficientBalance, setIsSufficientBalance] = useState(true);
  const [outputAmount, setOutputAmount] = useState(null);
  const updateInputAmount = useCallback(
    (newInputAmount, newIsMax = false) => {
      setInputAmount(newInputAmount);
      setIsMax(!!newInputAmount && newIsMax);

      const newOutputAmount = newInputAmount; // USDc for both cases
      if (inputSaving) {
        const newIsSufficientBalance =
          !newInputAmount ||
          greaterThanOrEqualTo(maxInputBalance, newInputAmount);

        setIsSufficientBalance(newIsSufficientBalance);
        setOutputAmount(newOutputAmount);
      }
    },
    [inputSaving, maxInputBalance]
  );

  const updateOutputAmount = useCallback(
    newOutputAmount => {
      setOutputAmount(newOutputAmount);
      if (inputSaving) {
        const newInputAmount = newOutputAmount;
        const newIsSufficientBalance =
          !newInputAmount ||
          greaterThanOrEqualTo(maxInputBalance, newInputAmount);

        setIsSufficientBalance(newIsSufficientBalance);
        setInputAmount(newInputAmount);
      }
    },
    [inputSaving, maxInputBalance]
  );

  return {
    inputAmount,
    isMax,
    isSufficientBalance,
    outputAmount,
    setIsSufficientBalance,
    updateInputAmount,
    updateOutputAmount,
  };
}
