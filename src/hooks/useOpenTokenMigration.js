import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setOpenTokenMigration } from '../redux/openStateSettings';

export default function useOpenTokenMigration() {
  const dispatch = useDispatch();

  const isTokenMigrationOpen = useSelector(
    ({ openStateSettings: { openTokenMigration } }) => openTokenMigration
  );

  const toggleOpenTokenMigration = useCallback(
    () => dispatch(setOpenTokenMigration(!isTokenMigrationOpen)),
    [dispatch, isTokenMigrationOpen]
  );

  return {
    isTokenMigrationOpen,
    toggleOpenTokenMigration,
  };
}
