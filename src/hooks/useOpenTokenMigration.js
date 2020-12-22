import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setTokenMigrationSavings } from '../redux/openStateSettings';

export default function useOpenTokenMigration() {
  const dispatch = useDispatch();

  const isTokenMigrationOpen = useSelector(
    ({ openStateSettings: { openTokenMigration } }) => openTokenMigration
  );

  const toggleOpenTokenMigration = useCallback(
    () => dispatch(setTokenMigrationSavings(!isTokenMigrationOpen)),
    [dispatch, isTokenMigrationOpen]
  );

  return {
    isTokenMigrationOpen,
    toggleOpenTokenMigration,
  };
}
