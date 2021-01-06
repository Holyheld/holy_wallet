import analytics from '@segment/analytics-react-native';
import PropTypes from 'prop-types';

import React, { useCallback, useEffect, useState } from 'react';
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
import { formatSavingsAmount } from '@rainbow-me/helpers/savings';
import { useDimensions } from '@rainbow-me/hooks';
import { colors, padding, position } from '@rainbow-me/styles';
import ShadowStack from 'react-native-shadow-stack';

const SavingsListRowShadows = [
  [0, 10, 30, colors.dark, 0.1],
  [0, 5, 15, colors.dark, 0.04],
];

const NOOP = () => undefined;

const neverRerender = () => true;
// eslint-disable-next-line react/display-name
const SavingsListRowGradient = React.memo(
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

  const initialValue = totalBalance;
  const [value] = useState(initialValue);

  const onButtonPress = useCallback(() => {
    navigate(Routes.SAVINGS_SHEET, {
      currentSaving: currentSaving,
      lifetimeAccruedInterest: 0.1,
      savings: savings,
      totalBalance: totalBalance,
    });
  }, []);

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

  const displayValue = formatSavingsAmount(value);

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
            {!isNaN(displayValue) ? (
              <RowWithMargins align="center" margin={8} paddingLeft={4}>
                <Text
                  color={colors.blueGreyDark}
                  letterSpacing="roundedTightest"
                  opacity={0.5}
                  size="lmedium"
                  weight="bold"
                >
                  {`$${totalBalance}`}
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
