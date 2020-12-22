import React from 'react';
import LinearGradient from 'react-native-linear-gradient';
import styled from 'styled-components/primitives';

import { ButtonPressAnimation } from '../animations';
import { Centered, Row, RowWithMargins } from '../layout';
import { Emoji, Text } from '../text';
import APYPill from './APYPill';
import { useDimensions } from '@rainbow-me/hooks';
import { colors, padding, position } from '@rainbow-me/styles';
import ShadowStack from 'react-native-shadow-stack';

const TokenMigrationListRowShadows = [
  [0, 10, 30, colors.dark, 0.1],
  [0, 5, 15, colors.dark, 0.04],
];

const neverRerender = () => true;
// eslint-disable-next-line react/display-name
const TokenMigrationListRowGradient = React.memo(
  () => (
    <LinearGradient
      borderRadius={49}
      colors={['#FFFFFF', '#F7F9FA']}
      end={{ x: 0.5, y: 1 }}
      pointerEvents="none"
      start={{ x: 0.5, y: 0 }}
      style={position.coverAsObject}
    />
  ),
  neverRerender
);

const TokenMigrationListRowShadowStack = styled(ShadowStack).attrs(
  ({ deviceWidth }) => ({
    borderRadius: 49,
    height: 49,
    shadows: TokenMigrationListRowShadows,
    width: deviceWidth - 38,
  })
)``;

const TokenMigrationListRow = () => {
  const { width: deviceWidth } = useDimensions();

  return (
    <ButtonPressAnimation overflowMargin={10} scaleTo={0.96}>
      <Centered direction="column" marginBottom={15}>
        <TokenMigrationListRowShadowStack deviceWidth={deviceWidth}>
          <TokenMigrationListRowGradient />
          <Row
            align="center"
            css={padding(9, 10, 10, 20)}
            justify="space-between"
            scaleTo={0.96}
          >
            <Centered>
              <Emoji lineHeight="none" name="flag_united_states" size={20} />
            </Centered>
            <RowWithMargins align="center" margin={8} paddingLeft={4}>
              <Text
                color={colors.blueGreyDark}
                letterSpacing="roundedTightest"
                opacity={0.5}
                size="lmedium"
                weight="bold"
              >
                $0.00
              </Text>
            </RowWithMargins>
            <APYPill value="22" />
          </Row>
        </TokenMigrationListRowShadowStack>
      </Centered>
    </ButtonPressAnimation>
  );
};

// TokenMigrationListRow.propTypes = {
//   underlying: PropTypes.object,
//   userBalance: PropTypes.string,
// };

export default React.memo(TokenMigrationListRow);
