import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setOpenLPBonus } from '../redux/openStateSettings';

export default function useOpenLPBonus() {
  const dispatch = useDispatch();

  const isLPBonusOpen = useSelector(
    ({ openStateSettings: { openLPBonus } }) => openLPBonus
  );

  const toggleOpenLPBonus = useCallback(
    () => dispatch(setOpenLPBonus(!isLPBonusOpen)),
    [dispatch, isLPBonusOpen]
  );

  return {
    isLPBonusOpen,
    toggleOpenLPBonus,
  };
}
