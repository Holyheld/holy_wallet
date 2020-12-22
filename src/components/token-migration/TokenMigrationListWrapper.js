import { map } from 'lodash';
import React, { Fragment } from 'react';
import useOpenTokenMigration from '../../hooks/useOpenTokenMigration';
import { OpacityToggler } from '../animations';
import TokenMigrationListHeader from './TokenMigrationListHeader';
import TokenMigrationListRow from './TokenMigrationListRow';

const renderTokenMigrationListRow = item => (
  <TokenMigrationListRow key={item?.symbol} {...item} />
);

export default function TokenMigrationListWrapper({
  assets,
  totalValue = '0',
}) {
  const {
    isTokenMigrationOpen,
    toggleOpenTokenMigration,
  } = useOpenTokenMigration();

  return (
    <Fragment>
      <TokenMigrationListHeader
        isOpen={isTokenMigrationOpen}
        onPress={toggleOpenTokenMigration}
        savingsSumValue={totalValue}
        showSumValue
      />
      <OpacityToggler
        isVisible={!isTokenMigrationOpen}
        pointerEvents={isTokenMigrationOpen ? 'auto' : 'none'}
      >
        {map(assets, renderTokenMigrationListRow)}
      </OpacityToggler>
    </Fragment>
  );
}
