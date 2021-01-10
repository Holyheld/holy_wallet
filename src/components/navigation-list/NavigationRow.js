import React from 'react';
import { StyleSheet, View } from 'react-native';
import colors from '../../styles/colors';
import { ButtonPressAnimation } from '../animations';
import { ColumnWithMargins, Row } from '../layout';
import { Text } from '../text';
import { deviceUtils } from '@rainbow-me/utils';

const maxLabelWidth = deviceUtils.dimensions.width - 88;
const NOOP = () => undefined;

const sx = StyleSheet.create({
  label: {
    color: colors.textColor,
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
              <Text
                letterSpacing="roundedMedium"
                size="lmedium"
                style={sx.label}
                weight="bold"
              >
                {title}
              </Text>
            </ColumnWithMargins>
          </Row>
        </Row>
      </ButtonPressAnimation>
    </View>
  );
}
