import React from 'react';
import { StyleSheet } from 'react-native';
import { ButtonPressAnimation } from '../animations';
import { InnerBorder, RowWithMargins } from '../layout';
import { Text } from '../text';
import { colors, position, shadow } from '@rainbow-me/styles';

const ButtonBorderRadius = 15;

const sx = StyleSheet.create({
  button: {
    ...position.centeredAsObject,
    ...shadow.buildAsObject(0, 4, 6, colors.buttonPrimary, 0.4),
    backgroundColor: colors.buttonPrimary,
    borderRadius: ButtonBorderRadius,
    height: 30,
    paddingBottom: 1,
    paddingRight: 2,
    width: 97,
  },
});

const SavingsListRowEmptyState = ({ onPress }) => (
  <RowWithMargins align="center" margin={8} paddingLeft={4}>
    <Text
      color={colors.textColor}
      letterSpacing="roundedTightest"
      opacity={0.5}
      size="lmedium"
      weight="bold"
    >
      $0.00
    </Text>
    <ButtonPressAnimation onPress={onPress} scaleTo={0.9} style={sx.button}>
      <Text
        color={colors.textColorPrimaryButton}
        letterSpacing="roundedTight"
        size="lmedium"
        weight="semibold"
      >
        􀁍 Deposit
      </Text>
      <InnerBorder radius={ButtonBorderRadius} />
    </ButtonPressAnimation>
  </RowWithMargins>
);

const neverRerender = () => true;
export default React.memo(SavingsListRowEmptyState, neverRerender);
