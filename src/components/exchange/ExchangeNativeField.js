import React, { useCallback, useEffect, useState } from 'react';
import { TouchableWithoutFeedback } from 'react-native';
import styled from 'styled-components/primitives';
import useDebounce from '../../hooks/useDebounce';
import supportedNativeCurrencies from '../../references/native-currencies.json';
import { Row } from '../layout';
import { Text } from '../text';
import ExchangeInput from './ExchangeInput';
import { colors, fonts } from '@holyheld-com/styles';

const CurrencySymbol = styled(Text).attrs(({ height }) => ({
  letterSpacing: 'roundedTight',
  lineHeight: height,
  size: 'larger',
  weight: 'regular',
}))`
  ${android ? 'margin-bottom: 1.5;' : ''};
`;

const NativeInput = styled(ExchangeInput).attrs({
  letterSpacing: fonts.letterSpacing.roundedTight,
  size: fonts.size.larger,
  weight: fonts.weight.regular,
})`
  height: ${({ height }) => height};
`;

const ExchangeNativeField = (
  {
    debounce,
    editable,
    height,
    nativeAmount,
    nativeCurrency,
    onFocus,
    setNativeAmount,
    testID,
  },
  ref
) => {
  const [isFocused, setIsFocused] = useState(false);
  const { mask, placeholder, symbol } = supportedNativeCurrencies[
    nativeCurrency
  ];

  const handleFocusNativeField = useCallback(() => ref?.current?.focus(), [
    ref,
  ]);

  const handleBlur = useCallback(() => setIsFocused(false), []);
  const handleFocus = useCallback(
    event => {
      setIsFocused(true);
      if (onFocus) onFocus(event);
    },
    [onFocus]
  );

  const [rawAmount, setRawAmount] = useState(null);
  const debouncedAmount = useDebounce(rawAmount, debounce);

  // Here's where the API call happens
  // We use useEffect since this is an asynchronous action
  useEffect(
    () => {
      // Make sure we have a value (user has entered something in input)
      if (setNativeAmount) {
        if (debouncedAmount) {
          setNativeAmount(debouncedAmount);
        } else {
          setNativeAmount();
        }
      }
    },
    // This is the useEffect input array
    // Our useEffect function will only execute if this value changes ...
    // ... and thanks to our hook it will only change if the original ...
    // value (searchTerm) hasn't changed for more than 500ms.
    [debouncedAmount]
  );

  const nativeAmountColor = isFocused
    ? colors.textColor
    : colors.textColorPlaceholder;

  return (
    <TouchableWithoutFeedback onPress={handleFocusNativeField}>
      <Row align="center" flex={1} height={height}>
        <CurrencySymbol color={nativeAmountColor} height={height}>
          {symbol}
        </CurrencySymbol>
        <NativeInput
          color={nativeAmountColor}
          editable={editable}
          height={height}
          mask={mask}
          onBlur={handleBlur}
          onChangeText={setRawAmount}
          onFocus={handleFocus}
          placeholder={placeholder}
          ref={ref}
          style={android ? { height: 58 } : {}}
          testID={nativeAmount ? `${testID}-${nativeAmount}` : testID}
          value={nativeAmount}
        />
      </Row>
    </TouchableWithoutFeedback>
  );
};

export default React.forwardRef(ExchangeNativeField);
