import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import colors from '../../styles/colors';
import { ButtonPressAnimation } from '../animations';
import { ColumnWithMargins, Row } from '../layout';
import { fonts, getFontSize } from '@rainbow-me/styles';
import { deviceUtils } from '@rainbow-me/utils';

const maxLabelWidth = deviceUtils.dimensions.width - 88;
const NOOP = () => undefined;

const sx = StyleSheet.create({
  label: {
    color: colors.textColor,
    fontFamily: fonts.family.SFProRounded,
    fontSize: getFontSize(fonts.size.lmedium),
    fontWeight: fonts.weight.semibold,
    letterSpacing: fonts.letterSpacing.roundedMedium,
    maxWidth: maxLabelWidth,
  },
  row: {
    flex: 1,
    justifyContent: 'center',
    marginLeft: 19,
  },
});

export default function NavigationRow({ title, onPress, disabled }) {
  return (
    <View style={sx.row}>
      <ButtonPressAnimation
        disabled={disabled}
        enableHapticFeedback
        onLongPress={NOOP}
        onPress={onPress}
        scaleTo={0.95}
      >
        <Row align="center">
          <Row align="center" flex={1}>
            <ColumnWithMargins margin={3}>
              <Text style={sx.label}>{title}</Text>
            </ColumnWithMargins>
          </Row>
        </Row>
      </ButtonPressAnimation>
    </View>
  );
}
