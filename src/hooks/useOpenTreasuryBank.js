import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setOpenTreasuryBank } from '../redux/openStateSettings';

export default function useOpenTreasuryBank() {
  const dispatch = useDispatch();

  const isTreasuryBankOpen = useSelector(
    ({ openStateSettings: { openTreasuryBank } }) => openTreasuryBank
  );

  const toggleOpenTreasuryBank = useCallback(
    () => dispatch(setOpenTreasuryBank(!isTreasuryBankOpen)),
    [dispatch, isTreasuryBankOpen]
  );

  return {
    isTreasuryBankOpen,
    toggleOpenTreasuryBank,
  };
}
