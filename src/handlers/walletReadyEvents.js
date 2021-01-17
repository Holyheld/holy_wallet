import { filter, find } from 'lodash';
import { IS_TESTING } from 'react-native-dotenv';
import { triggerOnSwipeLayout } from '../navigation/onNavigationStateChange';
import { getKeychainIntegrityState } from './localstorage/globalSettings';
import WalletBackupStepTypes from '@holyheld-com/helpers/walletBackupStepTypes';
import WalletTypes from '@holyheld-com/helpers/walletTypes';
import { Navigation } from '@holyheld-com/navigation';

import store from '@holyheld-com/redux/store';
import { checkKeychainIntegrity } from '@holyheld-com/redux/wallets';
import Routes from '@holyheld-com/routes';
import logger from 'logger';

const BACKUP_SHEET_DELAY_MS = 3000;

export const runKeychainIntegrityChecks = () => {
  setTimeout(async () => {
    const keychainIntegrityState = await getKeychainIntegrityState();
    if (!keychainIntegrityState) {
      await store.dispatch(checkKeychainIntegrity());
    }
  }, 5000);
};

export const runWalletBackupStatusChecks = () => {
  const { selected, wallets } = store.getState().wallets;

  // count how many visible, non-imported and non-readonly wallets are not backed up
  const rainbowWalletsNotBackedUp = filter(wallets, wallet => {
    const hasVisibleAccount = find(
      wallet.addresses,
      account => account.visible
    );
    return (
      !wallet.imported &&
      hasVisibleAccount &&
      wallet.type !== WalletTypes.readOnly &&
      !wallet.backedUp
    );
  });

  if (!rainbowWalletsNotBackedUp.length) return;

  logger.log('there is a rainbow wallet not backed up');
  const hasSelectedWallet = find(
    rainbowWalletsNotBackedUp,
    notBackedUpWallet => notBackedUpWallet.id === selected.id
  );

  logger.log(
    'rainbow wallet not backed up that is selected?',
    hasSelectedWallet
  );

  // if one of them is selected, show the default BackupSheet
  if (selected && hasSelectedWallet && IS_TESTING !== 'true') {
    logger.log('showing default BackupSheet');
    setTimeout(() => {
      triggerOnSwipeLayout(() =>
        Navigation.handleAction(Routes.BACKUP_SHEET, { single: true })
      );
    }, BACKUP_SHEET_DELAY_MS);
    return;
  }

  // otherwise, show the BackupSheet redirecting to the WalletSelectionList
  IS_TESTING !== 'true' &&
    setTimeout(() => {
      logger.log('showing BackupSheet with existing_user step');
      triggerOnSwipeLayout(() =>
        Navigation.handleAction(Routes.BACKUP_SHEET, {
          single: true,
          step: WalletBackupStepTypes.existing_user,
        })
      );
    }, BACKUP_SHEET_DELAY_MS);
  return;
};
