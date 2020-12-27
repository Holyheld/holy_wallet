import { map } from 'lodash';
import React, { Fragment } from 'react';
import useOpenTreasureBank from '../../hooks/useOpenTreasureBank';
import { OpacityToggler } from '../animations';
import TreasureBankListHeader from './TreasureBankListHeader';
import TreasureBankListRow from './TreasureBankListRow';

const renderTreasureBankListRow = item =>
  item?.underlying ? (
    <TreasureBankListRow key={item?.underlying.symbol} {...item} />
  ) : null;

export default function TreasureBankListWrapper({ assets, totalValue = '0' }) {
  const { isTreasureBankOpen, toggleOpenTreasureBank } = useOpenTreasureBank();

  return (
    <Fragment>
      <TreasureBankListHeader
        isOpen={isTreasureBankOpen}
        onPress={toggleOpenTreasureBank}
        savingsSumValue={totalValue}
        showSumValue
      />
      <OpacityToggler
        isVisible={!isTreasureBankOpen}
        pointerEvents={isTreasureBankOpen ? 'auto' : 'none'}
      >
        {map(assets, renderTreasureBankListRow)}
      </OpacityToggler>
    </Fragment>
  );
}
