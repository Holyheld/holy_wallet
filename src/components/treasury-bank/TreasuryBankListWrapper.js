import React, { Fragment } from 'react';
import useOpenTreasuryBank from '../../hooks/useOpenTreasuryBank';
import { OpacityToggler } from '../animations';
import TreasuryBankListHeader from './TreasuryBankListHeader';
import TreasuryBankListRow from './TreasuryBankListRow';

export default function TreasuryBankListWrapper({ assets, totalValue = '0' }) {
  const { isTreasuryBankOpen, toggleOpenTreasuryBank } = useOpenTreasuryBank();

  const singleTreasury = assets.length > 0 ? assets[0] : {};

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
        <TreasuryBankListRow treasury={singleTreasury} />
      </OpacityToggler>
    </Fragment>
  );
}
