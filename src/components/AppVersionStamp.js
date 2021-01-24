// import React, { useCallback, useState } from 'react';
import React from 'react';
// import { Alert } from 'react-native';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import styled from 'styled-components/primitives';
import { Text } from './text';
import {
  useAppVersion,
  // useTimeout,
  // useWalletsDebug,
} from '@holyheld-com/hooks';
import { colors } from '@holyheld-com/styles';

// const DEBUG_TAP_COUNT = 15;

const NOOP = () => undefined;

const StampText = styled(Text).attrs({
  align: 'center',
  color: colors.textColorMuted,
  lineHeight: 'normal',
  size: 'smedium',
  weight: 'bold',
})``;

export default function AppVersionStamp() {
  const appVersion = useAppVersion();
  // const [numberOfTaps, setNumberOfTaps] = useState(0);
  // const [startTimeout, stopTimeout] = useTimeout();
  // const debug = useWalletsDebug();
  //
  // const handleVersionPress = useCallback(async () => {
  //   if (!IS_DEV) {
  //     return;
  //   }
  //
  //   stopTimeout();
  //
  //   const tapCount = numberOfTaps + 1;
  //   setNumberOfTaps(tapCount);
  //
  //   // Only show the secret "debug info" alert if the
  //   // user has tapped this AppVersionStamp the secret amount of times
  //   if (tapCount === DEBUG_TAP_COUNT) {
  //     const { status, data } = await debug();
  //     if (status === 'restored') {
  //       Alert.alert('Wallet restored successfully!', data);
  //     } else {
  //       Alert.alert('DEBUG INFO', data);
  //     }
  //   }
  //
  //   startTimeout(() => setNumberOfTaps(0), 3000);
  // }, [debug, numberOfTaps, startTimeout, stopTimeout]);

  return (
    <TouchableWithoutFeedback onPress={NOOP}>
      <StampText>{appVersion}</StampText>
    </TouchableWithoutFeedback>
  );
}
