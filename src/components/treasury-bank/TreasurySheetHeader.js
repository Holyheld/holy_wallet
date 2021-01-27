import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';
import ButtonPressAnimation from '../animations/ButtonPressAnimation/ButtonPressAnimation.android';
import { Centered, RowWithMargins } from '../layout';
import { DollarFigure, Text } from '../text';
import { colors, padding } from '@holyheld-com/styles';

const ManageButton = styled(ButtonPressAnimation).attrs(({ editMode }) => ({
  radiusAndroid: 24,
  scaleTo: 0.96,
  wrapperStyle: {
    alignSelf: 'flex-end',
    height: 40,
    marginRight: 7,
    width: editMode ? 70 : 58,
  },
}))`
  padding: 12px;
  ${ios
    ? `
  position: absolute;
  right: 7px;
  top: 6px;
  `
    : `
    position: relative;
    right: 0px;
    top: -10px;
    z-index: 99999;
  `}
`;

const ManageButtonLabel = styled(Text).attrs(({ editMode }) => ({
  align: 'right',
  color: colors.textColor,
  letterSpacing: 'roundedMedium',
  size: 'large',
  weight: editMode ? 'semibold' : 'medium',
}))``;

const TreasurySheetHeader = ({ balance, ild, editMode, setEditMode }) => (
  <Centered css={padding(17, 0, 8)} direction="column">
    <Text
      color={colors.textColorMuted}
      letterSpacing="uppercase"
      size="smedium"
      uppercase
      weight="semibold"
    >
      TREASURY
    </Text>
    <ManageButton editMode={editMode} onPress={() => setEditMode(!editMode)}>
      <ManageButtonLabel editMode={editMode}>
        {editMode ? 'Done' : 'Manage'}
      </ManageButtonLabel>
    </ManageButton>
    <DollarFigure decimals={2} value={balance} />
    <RowWithMargins align="center" margin={4} marginTop={1}>
      <Text
        align="center"
        color={colors.green}
        letterSpacing="roundedTight"
        lineHeight="loose"
        size="large"
        weight="semibold"
      >
        ${ild}
      </Text>
    </RowWithMargins>
  </Centered>
);

TreasurySheetHeader.propTypes = {
  balance: PropTypes.string,
  ild: PropTypes.string,
};

export default TreasurySheetHeader;
