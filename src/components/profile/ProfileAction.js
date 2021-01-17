import React from 'react';
import styled from 'styled-components/primitives';
import { ButtonPressAnimation } from '../animations';
import { Icon } from '../icons';
import { RowWithMargins } from '../layout';
import { Text } from '../text';
import { colors, position } from '@holyheld-com/styles';

const Container = styled(RowWithMargins).attrs({
  align: 'center',
  justify: 'start',
  margin: 6,
})`
  background-color: ${colors.transparent};
  height: 34;
  padding-bottom: 2;
`;

const ProfileActionIcon = styled(Icon).attrs(({ color }) => ({
  color,
}))`
  ${({ iconSize }) => position.size(iconSize)};
  margin-top: 0.5;
`;

const ProfileAction = ({
  color = colors.textColorPrimary,
  icon,
  iconSize = 16,
  onPress,
  text,
  ...props
}) => (
  <ButtonPressAnimation
    onPress={onPress}
    overflowMargin={5}
    radiusAndroid={24}
    {...props}
  >
    <Container>
      <ProfileActionIcon color={color} iconSize={iconSize} name={icon} />
      <Text
        color={color}
        letterSpacing="roundedMedium"
        lineHeight={19}
        size="lmedium"
        weight="semibold"
      >
        {text}
      </Text>
    </Container>
  </ButtonPressAnimation>
);

export default React.memo(ProfileAction);
