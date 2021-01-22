import React, { Fragment } from 'react';
import { useOpenSavings } from '../../hooks';
import { OpacityToggler } from '../animations';
import HolySavingsListRow from './HolySavingsListRow';
import SavingsListHeader from './SavingsListHeader';

export default function HolySavingsListWrapper({
  savings,
  totalBalance = '0',
}) {
  const { isSavingsOpen, toggleOpenSavings } = useOpenSavings();

  const singleSavings = savings.length > 0 ? savings[0] : {};

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
        <HolySavingsListRow
          savings={singleSavings}
          totalBalance={totalBalance}
        />
      </OpacityToggler>
    </Fragment>
  );
}
