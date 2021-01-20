import BigNumber from 'bignumber.js';
import PropTypes from 'prop-types';
import React, { useMemo } from 'react';
import { Centered, Row, RowWithMargins } from '../layout';
import { Text } from '../text';
import { colors, padding } from '@holyheld-com/styles';

const LPBonusSheetHeader = ({ nativeBalance, nativeDPYBalance }) => {
  const diplayedNativeBalance = useMemo(
    () => new BigNumber(nativeBalance).toFormat(2),
    [nativeBalance]
  );

  const dispalyedNativeDPYBalance = useMemo(
    () => new BigNumber(nativeDPYBalance).toFormat(2),
    [nativeDPYBalance]
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
          ${diplayedNativeBalance}
        </Text>
      </Row>
      <RowWithMargins align="center" margin={4} marginTop={1}>
        <Text
          align="center"
          color={colors.green}
          letterSpacing="roundedTight"
          lineHeight="loose"
          size="large"
          weight="semibold"
        >
          ${dispalyedNativeDPYBalance}
        </Text>
      </RowWithMargins>
    </Centered>
  );
};

LPBonusSheetHeader.propTypes = {
  nativeBalance: PropTypes.string,
};

export default LPBonusSheetHeader;
