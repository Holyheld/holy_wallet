import BigNumber from 'bignumber.js';
import React, { useCallback, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import styled from 'styled-components/primitives';
import { HOLY_TREASURY } from '../../config/experimental';
import useExperimentalFlag from '../../config/experimentalHooks';
import { greaterThan } from '../../helpers/utilities';
import { useNavigation } from '../../navigation/Navigation';

import Routes from '../../navigation/routesNames';
import APYPill from '../APYPill';
import { ButtonPressAnimation } from '../animations';
import { Centered, InnerBorder, Row, RowWithMargins } from '../layout';
import SavingsIcon from '../savings/SavingsIcon';
import { Text } from '../text';
import { useDimensions } from '@holyheld-com/hooks';
import { colors, padding, position } from '@holyheld-com/styles';
import ShadowStack from 'react-native-shadow-stack';

const NOOP = () => undefined;
const ButtonBorderRadius = 15;

const TreasuryBankListRowShadows = [
  [0, 10, 30, colors.dark, 0.2],
  [0, 5, 15, colors.dark, 0.4],
];

const sx = StyleSheet.create({
  button: {
    ...position.centeredAsObject,
    backgroundColor: colors.apyPillBackground,
    borderRadius: ButtonBorderRadius,
    height: 30,
    paddingBottom: 1,
    paddingRight: 2,
    width: 97,
  },
});

const TreasuryBankListRowShadowStack = styled(ShadowStack).attrs(
  ({ deviceWidth }) => ({
    backgroundColor: colors.sectionItemBackground,
    borderRadius: 49,
    height: 49,
    shadows: TreasuryBankListRowShadows,
    width: deviceWidth - 38,
  })
)``;

const TreasuryBankListRow = () => {
  const { width: deviceWidth } = useDimensions();
  const { navigate } = useNavigation();

  const balance = '0.00';

  const { displayedBalance, isEmpty } = useMemo(() => {
    const isEmpty = !greaterThan(balance, '0');
    let displayedBalance = '0.00';
    if (isEmpty) {
      displayedBalance = new BigNumber(balance).toFixed(2);
    } else {
      displayedBalance = new BigNumber(balance).decimalPlaces(8).toString();
    }
    return {
      displayedBalance,
      isEmpty,
    };
  }, [balance]);

  const disabled = !useExperimentalFlag(HOLY_TREASURY);

  const onButtonPress = useCallback(() => {
    //console.log('GO TO TREASURY');
    if (!disabled && !isEmpty) {
      navigate(Routes.TREASURY_SHEET, {
        balance: balance,
        lifetimeSupplyInterestAccrued: '10',
      });
    }
  }, [navigate, disabled, isEmpty]);

  return (
    <ButtonPressAnimation
      onPress={onButtonPress}
      overflowMargin={10}
      scaleTo={0.96}
    >
      <Centered direction="column" marginBottom={15}>
        <TreasuryBankListRowShadowStack deviceWidth={deviceWidth}>
          <Row
            align="center"
            css={padding(9, 10, 10, 20)}
            justify="space-between"
            onPress={() => {}}
            scaleTo={0.96}
          >
            {!isEmpty && <SavingsIcon size={23} />}
            <RowWithMargins align="center" margin={8} paddingLeft={4}>
              <Text
                color={colors.textColor}
                letterSpacing="roundedTightest"
                opacity={0.5}
                size="lmedium"
                weight="bold"
              >
                {`$${displayedBalance}`}
              </Text>
              {isEmpty && (
                <ButtonPressAnimation
                  onPress={NOOP}
                  scaleTo={0.9}
                  style={sx.button}
                >
                  <Text
                    color={colors.textColor}
                    letterSpacing="roundedTight"
                    size="lmedium"
                    weight="semibold"
                  >
                    Pending
                  </Text>
                  <InnerBorder radius={ButtonBorderRadius} />
                </ButtonPressAnimation>
              )}
            </RowWithMargins>
            <APYPill postfix="x" value="0.00" />
          </Row>
        </TreasuryBankListRowShadowStack>
      </Centered>
    </ButtonPressAnimation>
  );
};

// TreasuryBankListRow.propTypes = {
//   underlying: PropTypes.object,
//   userBalance: PropTypes.string,
// };

export default React.memo(TreasuryBankListRow);
