import BigNumber from 'bignumber.js';
import PropTypes from 'prop-types';
import React, { useMemo } from 'react';
import { Centered, Row } from '../layout';
import { Text } from '../text';
import { colors, padding } from '@holyheld-com/styles';

const LPBonusSheetHeader = ({ balance }) => {
  const diplayedBalance = useMemo(
    () => new BigNumber(balance).decimalPlaces(8).toString(),
    [balance]
  );

  return (
    <Centered css={padding(17, 0, 8)} direction="column">
      <Text
        color={colors.textColorMuted}
        letterSpacing="uppercase"
        size="smedium"
        uppercase
        weight="semibold"
      >
        EARLY LP BONUS
      </Text>
      <Row>
        <Text letterSpacing="zero" size="h1" weight="heavy">
          {diplayedBalance}
        </Text>
      </Row>
    </Centered>
  );
};

LPBonusSheetHeader.propTypes = {
  balance: PropTypes.string,
};

export default LPBonusSheetHeader;
