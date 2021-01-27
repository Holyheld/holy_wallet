import React, { useCallback, useEffect, useState } from 'react';
import { TouchableWithoutFeedback } from 'react-native';
import styled from 'styled-components/primitives';
import useDebounce from '../../hooks/useDebounce';
import { TokenSelectionButton } from '../buttons';
import { CoinIcon } from '../coin-icon';
import { Row, RowWithMargins } from '../layout';
import { EnDash } from '../text';
import ExchangeInput from './ExchangeInput';
import { colors } from '@holyheld-com/styles';

const CoinSize = 40;
const ExchangeFieldHeight = android ? 64 : 38;
const ExchangeFieldPadding = android ? 15 : 19;
const skeletonColor = colors.skeletonColor;

const Container = styled(Row).attrs({
  align: 'center',
  justify: 'flex-end',
})`
  width: 100%;
  padding-right: ${ExchangeFieldPadding};
`;

const FieldRow = styled(RowWithMargins).attrs({
  align: 'center',
  margin: 10,
})`
  flex: 1;
  padding-left: ${ExchangeFieldPadding};
  padding-right: ${({ disableCurrencySelection }) =>
    disableCurrencySelection ? ExchangeFieldPadding : 0};
`;

const Input = styled(ExchangeInput).attrs({
  letterSpacing: 'roundedTightest',
})`
  margin-vertical: -10;
  height: ${ExchangeFieldHeight + (android ? 20 : 0)};
`;

const ExchangeField = (
  {
    address,
    amount,
    debounce = 100,
    disableCurrencySelection,
    onBlur,
    onFocus,
    onPressSelectCurrency,
    setAmount,
    symbol,
    testID,
    autoFocus,
    useCustomAndroidMask = false,
    ...props
  },
  ref
) => {
  const handleFocusField = useCallback(() => ref?.current?.focus(), [ref]);
  const [rawAmount, setRawAmount] = useState(null);
  const debouncedAmount = useDebounce(rawAmount, debounce);

  // Here's where the API call happens
  // We use useEffect since this is an asynchronous action
  useEffect(
    () => {
      // Make sure we have a value (user has entered something in input)
      if (debouncedAmount) {
        setAmount(debouncedAmount);
      } else {
        setAmount();
      }
    },
    // This is the useEffect input array
    // Our useEffect function will only execute if this value changes ...
    // ... and thanks to our hook it will only change if the original ...
    // value (searchTerm) hasn't changed for more than 500ms.
    [debouncedAmount]
  );

  useEffect(() => {
    autoFocus && handleFocusField();
  }, [autoFocus, handleFocusField]);
  return (
    <Container {...props}>
      <TouchableWithoutFeedback onPress={handleFocusField}>
        <FieldRow disableCurrencySelection={disableCurrencySelection}>
          {symbol ? (
            <CoinIcon address={address} size={CoinSize} symbol={symbol} />
          ) : (
            <CoinIcon bgColor={skeletonColor} size={CoinSize} />
          )}
          <Input
            editable={!!symbol}
            onBlur={onBlur}
            onChangeText={setRawAmount}
            onFocus={onFocus}
            placeholder={symbol ? '0' : EnDash.unicode}
            placeholderTextColor={symbol ? undefined : skeletonColor}
            ref={ref}
            testID={amount ? `${testID}-${amount}` : testID}
            useCustomAndroidMask={useCustomAndroidMask}
            value={amount}
          />
        </FieldRow>
      </TouchableWithoutFeedback>
      {!disableCurrencySelection && (
        <TokenSelectionButton
          onPress={onPressSelectCurrency}
          symbol={symbol}
          testID={testID + '-selection-button'}
        />
      )}
    </Container>
  );
};

export default React.forwardRef(ExchangeField);
