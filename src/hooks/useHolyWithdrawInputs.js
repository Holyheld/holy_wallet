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

      if (inputSaving) {
        const newIsSufficientBalance =
          !newInputAmount ||
          greaterThanOrEqualTo(maxInputBalance, newInputAmount);

        setIsSufficientBalance(newIsSufficientBalance);
      }
    },
    [inputSaving, maxInputBalance]
  );

  const updateOutputAmount = useCallback(newOutputAmount => {
    setOutputAmount(newOutputAmount);
  }, []);

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
