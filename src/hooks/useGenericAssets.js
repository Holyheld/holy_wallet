import { get } from 'lodash';
import { useSelector } from 'react-redux';
import { USDC_TOKEN_ADDRESS } from '../references/holy';
import { useAccountSettings } from '.';

export function useUSDcTokenPrice() {
  const { network } = useAccountSettings();

  const usdcAsset = useSelector(
    state => state.data.genericAssets[USDC_TOKEN_ADDRESS(network)]
  );

  return get(usdcAsset, 'price.value', 1);
}
