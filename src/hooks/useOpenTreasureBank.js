import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setOpenTreasureBank } from '../redux/openStateSettings';

export default function useOpenTreasureBank() {
  const dispatch = useDispatch();

  const isTreasureBankOpen = useSelector(
    ({ openStateSettings: { openTreasureBank } }) => openTreasureBank
  );

  const toggleOpenTreasureBank = useCallback(
    () => dispatch(setOpenTreasureBank(!isTreasureBankOpen)),
    [dispatch, isTreasureBankOpen]
  );

  return {
    isTreasureBankOpen,
    toggleOpenTreasureBank,
  };
}
