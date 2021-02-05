import PropTypes from 'prop-types';
import React from 'react';
import { Centered, RowWithMargins } from '../layout';
import { DollarFigure, Text } from '../text';
import { colors, padding } from '@holyheld-com/styles';

const SavingsSheetHeader = ({ balance, ildBalance }) => (
  <Centered css={padding(17, 0, 8)} direction="column">
    <Text
      color={colors.textColorMuted}
      letterSpacing="uppercase"
      size="smedium"
      uppercase
      weight="semibold"
    >
      Savings
    </Text>
    <DollarFigure currencySymbol="$" decimals={2} value={balance} />
    <RowWithMargins align="center" margin={4} marginTop={1}>
      <Text
        align="center"
        color={colors.green}
        letterSpacing="roundedTight"
        lineHeight="loose"
        size="large"
        weight="semibold"
      >
        􀁍 ${ildBalance}
      </Text>
    </RowWithMargins>
  </Centered>
);

SavingsSheetHeader.propTypes = {
  balance: PropTypes.string,
  ildBalance: PropTypes.string,
};

export default SavingsSheetHeader;
