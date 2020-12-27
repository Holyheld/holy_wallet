import { map } from 'lodash';
import React, { Fragment } from 'react';
import useOpenLPBonus from '../../hooks/useOpenLPBonus';
import { OpacityToggler } from '../animations';
import LPBonusListHeader from './LPBonusListHeader';
import LPBonusListRow from './LPBonusListRow';

const renderLPBonusListRow = item =>
  item?.underlying ? (
    <LPBonusListRow key={item?.underlying.symbol} {...item} />
  ) : null;

export default function LPBonusListWrapper({ assets, totalValue = '0' }) {
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
        {map(assets, renderLPBonusListRow)}
      </OpacityToggler>
    </Fragment>
  );
}
