import PropTypes from 'prop-types';
import React, { useCallback } from 'react';
import { requireNativeComponent, StyleSheet } from 'react-native';
import isRainbowTextAvailable from '../../helpers/isRainbowTextAvailable';
import { formatSavingsAmount, isSymbolStablecoin } from '../../helpers/savings';
import AndroidText from './AndroidAnimatedNumbers';
import { colors, fonts } from '@holyheld-com/styles';

const sx = StyleSheet.create({
  animatedNumber: {
    height: 30,
    left: 0,
    maxWidth: 150,
  },
  animatedNumberAndroid: {},
  text: {
    alignItems: 'center',
    display: 'flex',
    flex: 1,
    fontFamily: fonts.family.SFProRounded,
    fontSize: parseFloat(fonts.size.lmedium),
    fontWeight: fonts.weight.bold,
    justifyContent: 'center',
    letterSpacing: fonts.letterSpacing.roundedTightest,
    marginBottom: 0.5,
    marginLeft: 6,
    marginRight: 4,
    textAlign: 'center',
  },
});

const SavingsListRowAnimatedNumber = ({
  initialValue,
  interval,
  steps,
  symbol,
  value,
}) => {
  const formatter = useCallback(
    val => `${formatSavingsAmount(val)} ${symbol} `,
    [symbol]
  );

  const TextComponent = isRainbowTextAvailable
    ? requireNativeComponent('RainbowText')
    : AndroidText;

  return (
    <TextComponent
      animationConfig={{
        baseColor: colors.textColor,
        color: ios ? '#2CCC00' : '#2CFF00', // HEX
        decimals: 10,
        duration: 80, // in intervals
        initialValue: Number(initialValue),
        interval,
        isSymbolStablecoin: isSymbolStablecoin(symbol),
        stepPerDay: Number(value) - Number(initialValue),
        symbol: symbol,
      }}
      formatter={formatter}
      initialValue={Number(initialValue)}
      steps={steps}
      style={[
        sx.text,
        isRainbowTextAvailable ? sx.animatedNumber : null,
        android ? sx.animatedNumberAndroid : null,
      ]}
      time={interval}
      value={Number(value)}
    >
      {isRainbowTextAvailable ? null : formatter(initialValue)}
    </TextComponent>
  );
};

SavingsListRowAnimatedNumber.propTypes = {
  initialValue: PropTypes.string,
  interval: PropTypes.number,
  steps: PropTypes.number,
  symbol: PropTypes.string,
  value: PropTypes.string,
};

export default React.memo(SavingsListRowAnimatedNumber);
