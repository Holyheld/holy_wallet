import analytics from '@segment/analytics-react-native';
import PropTypes from 'prop-types';

import React, { useCallback, useEffect } from 'react';
import { InteractionManager } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import styled from 'styled-components/primitives';
import { useNavigation } from '../../navigation/Navigation';
import Routes from '../../navigation/routesNames';

import { ButtonPressAnimation } from '../animations';
import { Centered, Row, RowWithMargins } from '../layout';
import { Emoji, Text } from '../text';
import APYPill from './APYPill';
import SavingsListRowEmptyState from './SavingsListRowEmptyState';
import { useDimensions } from '@rainbow-me/hooks';
import { colors, padding, position } from '@rainbow-me/styles';
import ShadowStack from 'react-native-shadow-stack';

const SavingsListRowShadows = [
  [0, 10, 30, colors.dark, 0.2],
  [0, 5, 15, colors.dark, 0.4],
];

const NOOP = () => undefined;

const neverRerender = () => true;
// eslint-disable-next-line react/display-name
const SavingsListRowGradient = React.memo(
  () => (
    <LinearGradient
      borderRadius={49}
      colors={[colors.rowBackground, colors.rowBackgroundSecondary]}
      end={{ x: 0.5, y: 1 }}
      pointerEvents="none"
      start={{ x: 0.5, y: 0 }}
      style={position.coverAsObject}
    />
  ),
  neverRerender
);

const SavingsListRowShadowStack = styled(ShadowStack).attrs(
  ({ deviceWidth }) => ({
    borderRadius: 49,
    height: 49,
    shadows: SavingsListRowShadows,
    width: deviceWidth - 38,
  })
)``;

const SavingsListRow = ({ totalBalance, currentSaving, savings }) => {
  const { width: deviceWidth } = useDimensions();
  const { navigate } = useNavigation();

  const onButtonPress = useCallback(() => {
    navigate(Routes.SAVINGS_SHEET, {
      currentSaving: currentSaving,
      lifetimeAccruedInterest: 0.1,
      savings: savings,
      totalBalance: totalBalance,
    });
  }, [currentSaving, navigate, savings, totalBalance]);

  useEffect(() => {
    if (
      currentSaving.underlying &&
      currentSaving.underlying.symbol &&
      currentSaving.balance
    )
      InteractionManager.runAfterInteractions(() => {
        analytics.track('User has savings', {
          category: 'savings',
          label: currentSaving.underlying.symbol,
        });
      });
  }, [currentSaving]);

  const displayValue = parseFloat(totalBalance).toFixed(2);

  return (
    <ButtonPressAnimation
      onPress={onButtonPress}
      overflowMargin={10}
      scaleTo={0.96}
    >
      <Centered direction="column" marginBottom={15}>
        <SavingsListRowShadowStack deviceWidth={deviceWidth}>
          <SavingsListRowGradient />
          <Row
            align="center"
            css={padding(9, 10, 10, 20)}
            justify="space-between"
            onPress={() => {}}
            scaleTo={0.96}
          >
            <Centered>
              <Emoji lineHeight="none" name="flag_united_states" size={20} />
            </Centered>
            {!isNaN(displayValue) && totalBalance !== '0' ? (
              <RowWithMargins align="center" margin={8} paddingLeft={4}>
                <Text
                  color={colors.textColor}
                  letterSpacing="roundedTightest"
                  opacity={0.5}
                  size="lmedium"
                  weight="bold"
                >
                  {`$${displayValue}`}
                </Text>
              </RowWithMargins>
            ) : (
              <SavingsListRowEmptyState onPress={NOOP} />
            )}
            <APYPill value={currentSaving.apy} />
          </Row>
        </SavingsListRowShadowStack>
      </Centered>
    </ButtonPressAnimation>
  );
};

SavingsListRow.propTypes = {
  currentSaving: PropTypes.object,
  savings: PropTypes.array,
  totalBalance: PropTypes.string,
};

export default React.memo(SavingsListRow);
