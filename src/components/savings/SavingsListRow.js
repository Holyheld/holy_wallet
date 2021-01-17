import analytics from '@segment/analytics-react-native';
import PropTypes from 'prop-types';

import React, { useCallback, useEffect } from 'react';
import { InteractionManager } from 'react-native';
import styled from 'styled-components/primitives';
import { useNavigation } from '../../navigation/Navigation';
import Routes from '../../navigation/routesNames';
import {
  SavingsSheetEmptyHeight,
  SavingsSheetHeight,
} from '../../screens/HolySavingsSheet';

import APYPill from '../APYPill';
import { ButtonPressAnimation } from '../animations';
import { Centered, Row, RowWithMargins } from '../layout';
import { Text } from '../text';
import SavingsIcon from './SavingsIcon';
import SavingsListRowEmptyState from './SavingsListRowEmptyState';
import { useDimensions } from '@holyheld-com/hooks';
import { colors, padding } from '@holyheld-com/styles';
import ShadowStack from 'react-native-shadow-stack';

const SavingsListRowShadows = [
  [0, 10, 30, colors.dark, 0.2],
  [0, 5, 15, colors.dark, 0.4],
];

const NOOP = () => undefined;

const SavingsListRowShadowStack = styled(ShadowStack).attrs(
  ({ deviceWidth }) => ({
    backgroundColor: colors.sectionItemBackground,
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
      longFormHeight:
        totalBalance === '0' ? SavingsSheetEmptyHeight : SavingsSheetHeight,
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
          <Row
            align="center"
            css={padding(9, 10, 10, 20)}
            justify="space-between"
            onPress={() => {}}
            scaleTo={0.96}
          >
            {!isNaN(displayValue) && totalBalance !== '0' ? (
              <>
                <SavingsIcon size={23} />
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
              </>
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
