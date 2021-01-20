import React, { Fragment } from 'react';
import useOpenLPBonus from '../../hooks/useOpenLPBonus';
import { OpacityToggler } from '../animations';
import LPBonusListHeader from './LPBonusListHeader';
import LPBonusListRow from './LPBonusListRow';

export default function LPBonusListWrapper({ totalValue = '0' }) {
  const { isLPBonusOpen, toggleOpenLPBonus } = useOpenLPBonus();

  return (
    <Fragment>
      <LPBonusListHeader
        isOpen={isLPBonusOpen}
        onPress={toggleOpenLPBonus}
        savingsSumValue={totalValue}
        showSumValue
      />
      <OpacityToggler
        isVisible={!isLPBonusOpen}
        pointerEvents={isLPBonusOpen ? 'auto' : 'none'}
      >
        <LPBonusListRow />
      </OpacityToggler>
    </Fragment>
  );
}
