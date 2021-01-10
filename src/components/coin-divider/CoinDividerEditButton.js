import React, { useCallback } from 'react';
import { LayoutAnimation } from 'react-native';
import styled from 'styled-components/primitives';
import { magicMemo } from '../../utils';
import { ButtonPressAnimation, OpacityToggler } from '../animations';
import { Row } from '../layout';
import { Text } from '../text';
import { colors, padding, shadow } from '@rainbow-me/styles';

const ButtonContent = styled(Row).attrs({
  justify: 'center',
})`
  ${padding(ios ? 5 : 0, 10, 6)};
  ${({ isActive }) =>
    isActive ? shadow.build(0, 4, 12, colors.transparent, 0.4) : ''};
  background-color: ${({ isActive }) =>
    isActive ? colors.buttonPrimary : colors.buttonSecondary};
  border-radius: 15;
  height: 30;
`;

const CoinDividerEditButton = ({
  isActive,
  isVisible,
  onPress,
  shouldReloadList,
  style,
  text,
  textOpacityAlwaysOn,
}) => {
  const handlePress = useCallback(async () => {
    await onPress();
    if (shouldReloadList) {
      LayoutAnimation.configureNext(
        LayoutAnimation.create(200, 'easeInEaseOut', 'opacity')
      );
    }
  }, [onPress, shouldReloadList]);

  return (
    <OpacityToggler isVisible={!isVisible}>
      <ButtonPressAnimation
        onPress={handlePress}
        radiusAndroid={15}
        scaleTo={textOpacityAlwaysOn || isActive ? 0.9 : 1}
      >
        <ButtonContent isActive={isActive} style={style}>
          <Text
            align="center"
            color={
              isActive
                ? colors.textColorPrimaryButton
                : colors.textColorSecondaryButton
            }
            letterSpacing="roundedTight"
            opacity={1}
            size="lmedium"
            weight="bold"
          >
            {text}
          </Text>
        </ButtonContent>
      </ButtonPressAnimation>
    </OpacityToggler>
  );
};

export default magicMemo(CoinDividerEditButton, [
  'isActive',
  'isVisible',
  'text',
]);
