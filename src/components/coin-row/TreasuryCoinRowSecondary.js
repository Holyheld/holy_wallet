import React, { createElement } from 'react';
import { StyleSheet, View } from 'react-native';
import styled from 'styled-components/primitives';
import { ButtonPressAnimation } from '../animations';
import { CoinIcon } from '../coin-icon';
import CoinIconGroup from '../coin-icon/CoinIconGroup';
import { BottomRowText } from '../coin-row';
import { Icon } from '../icons';
import { Centered, Column, Row } from '../layout';
import { Text } from '../text';
import { colors, fonts, getFontSize } from '@holyheld-com/styles';

const sx = StyleSheet.create({
  accountRow: {
    flex: 1,
    justifyContent: 'center',
    marginLeft: 19,
  },
  bottomRowText: {
    color: colors.textColorMuted,
    fontSize: getFontSize(fonts.size.small),
    fontWeight: fonts.weight.medium,
    letterSpacing: fonts.letterSpacing.roundedMedium,
    lineHeight: getFontSize(fonts.size.small),
  },
  editIcon: {
    color: colors.textColorPrimary,
    fontFamily: fonts.family.SFProRounded,
    fontSize: getFontSize(fonts.size.large),
    fontWeight: fonts.weight.medium,
    textAlign: 'center',
  },
  rightContent: {
    flex: 0,
    flexDirection: 'row',
    marginLeft: 48,
  },
});

const OptionsIcon = ({ onPress }) => (
  <ButtonPressAnimation onPress={onPress} scaleTo={0.9}>
    <Centered height={40} width={60}>
      {android ? (
        <Icon
          circle
          color={colors.textColorPrimary}
          name="threeDots"
          tightDots
        />
      ) : (
        <Text style={sx.editIcon}>􀍡</Text>
      )}
    </Centered>
  </ButtonPressAnimation>
);

const TokenName = styled(Text).attrs({
  align: 'left',
  letterSpacing: 'roundedTight',
  lineHeight: 'loose',
  size: 'smedium',
  weight: 'semibold',
})``;

export default function TreasuryCoinRowSecondary({
  address,
  coinIconRenderer = CoinIcon,
  value,
  editMode,
  onPress,
  tokens,
  name,
  symbol,
  onOptionsPress,
}) {
  const isPool = tokens && tokens.length > 0;

  return (
    <View style={sx.accountRow}>
      <ButtonPressAnimation
        enableHapticFeedback={!editMode}
        onLongPress={onOptionsPress}
        onPress={editMode ? onOptionsPress : onPress}
        scaleTo={editMode ? 1 : 0.98}
      >
        <Row align="center">
          <Row align="center" flex={1} height={59}>
            {isPool ? (
              <CoinIconGroup tokens={tokens} />
            ) : (
              createElement(coinIconRenderer, {
                address,
                size: 40,
                symbol,
              })
            )}
            <Column flex={1} marginLeft={5}>
              <TokenName>{name}</TokenName>
              <BottomRowText marginTop={0.5} style={sx.bottomRowText}>
                {value} {symbol}
              </BottomRowText>
            </Column>
          </Row>
          <Column flexShrink={1} style={sx.rightContent}>
            <OptionsIcon onPress={onOptionsPress} />
          </Column>
        </Row>
      </ButtonPressAnimation>
    </View>
  );
}
