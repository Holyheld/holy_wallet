import React, { useCallback } from 'react';
import { useIsEmulator } from 'react-native-device-info';
import { Prompt } from '../alerts';
import { Button } from '../buttons';
import { useWalletConnectConnections } from '@holyheld-com/hooks';
import { colors } from '@holyheld-com/styles';

export default function EmulatorPasteUriButton() {
  const { result: isEmulator } = useIsEmulator();
  const { walletConnectOnSessionRequest } = useWalletConnectConnections();

  const handlePastedUri = useCallback(
    async uri => walletConnectOnSessionRequest(uri),
    [walletConnectOnSessionRequest]
  );

  const handlePressPasteSessionUri = useCallback(() => {
    Prompt({
      callback: handlePastedUri,
      message: 'Paste WalletConnect URI below',
      title: 'New WalletConnect Session',
      type: 'plain-text',
    });
  }, [handlePastedUri]);

  return isEmulator ? (
    <Button
      backgroundColor={colors.textColorSecondaryButton}
      color={colors.buttonSecondary}
      onPress={handlePressPasteSessionUri}
      size="small"
      type="pill"
    >
      Paste session URI
    </Button>
  ) : null;
}
