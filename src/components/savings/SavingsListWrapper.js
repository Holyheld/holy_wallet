import React, { Fragment } from 'react';
import { useOpenSavings } from '../../hooks';
import { OpacityToggler } from '../animations';
import SavingsListHeader from './SavingsListHeader';
import SavingsListRow from './SavingsListRow';

const renderSavingsListRow = (savingItem, totalBalance, allSavings) => {
  return (
    <SavingsListRow
      currentSaving={savingItem}
      key={savingItem.underlying.symbol}
      savings={allSavings}
      totalBalance={totalBalance}
    />
  );
};

export default function SavingsListWrapper({ savings, totalBalance = '0' }) {
  const { isSavingsOpen, toggleOpenSavings } = useOpenSavings();

  const deafultSavingAsset = savings[0];

  return (
    <Fragment>
      <SavingsListHeader
        isOpen={isSavingsOpen}
        onPress={toggleOpenSavings}
        savingsSumValue={totalBalance}
        showSumValue
      />
      <OpacityToggler
        isVisible={!isSavingsOpen}
        pointerEvents={isSavingsOpen ? 'auto' : 'none'}
      >
        {renderSavingsListRow(deafultSavingAsset, totalBalance, savings)}
      </OpacityToggler>
    </Fragment>
  );
}
