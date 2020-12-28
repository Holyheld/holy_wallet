import { map } from 'lodash';
import React, { Fragment } from 'react';
import useOpenTreasuryBank from '../../hooks/useOpenTreasuryBank';
import { OpacityToggler } from '../animations';
import TreasuryBankListHeader from './TreasuryBankListHeader';
import TreasuryBankListRow from './TreasuryBankListRow';

const renderTreasuryBankListRow = item =>
  item?.underlying ? (
    <TreasuryBankListRow key={item?.underlying.symbol} {...item} />
  ) : null;

export default function TreasuryBankListWrapper({ assets, totalValue = '0' }) {
  const { isTreasuryBankOpen, toggleOpenTreasuryBank } = useOpenTreasuryBank();

  return (
    <Fragment>
      <TreasuryBankListHeader
        isOpen={isTreasuryBankOpen}
        onPress={toggleOpenTreasuryBank}
        savingsSumValue={totalValue}
        showSumValue
      />
      <OpacityToggler
        isVisible={!isTreasuryBankOpen}
        pointerEvents={isTreasuryBankOpen ? 'auto' : 'none'}
      >
        {map(assets, renderTreasuryBankListRow)}
      </OpacityToggler>
    </Fragment>
  );
}
