import { useIsFocused, useRoute } from '@react-navigation/native';
import React, { Fragment, useCallback, useEffect, useMemo } from 'react';
import { StatusBar } from 'react-native';
import Animated, { Extrapolate } from 'react-native-reanimated';
import styled from 'styled-components/primitives';
import GestureBlocker from '../components/GestureBlocker';
import { interpolate } from '../components/animations';
import {
  CurrencySelectionList,
  CurrencySelectModalHeader,
} from '../components/exchange';
import { Column, KeyboardFixedOpenLayout } from '../components/layout';
import { Modal } from '../components/modal';
import CurrencySelectionTypes from '../helpers/currencySelectionTypes';
import { delayNext } from '../hooks/useMagicAutofocus';
import { useNavigation } from '../navigation/Navigation';
import { useInteraction, usePrevious } from '@holyheld-com/hooks';
import Routes from '@holyheld-com/routes';
import { position } from '@holyheld-com/styles';

const TabTransitionAnimation = styled(Animated.View)`
  ${position.size('100%')};
`;

const headerlessSection = data => [{ data, title: '' }];
const Wrapper = ios ? KeyboardFixedOpenLayout : Fragment;

export const HolySavingsSelectModalType = {
  input: 'input',
  output: 'output',
};

export default function HolySavingsSelectModal() {
  const isFocused = useIsFocused();
  const prevIsFocused = usePrevious(isFocused);
  const { navigate, dangerouslyGetState } = useNavigation();
  const {
    params: {
      onSelectSaving,
      restoreFocusOnSwapModal,
      setPointerEvents,
      tabTransitionPosition,
      toggleGestureEnabled,
      type,
    },
  } = useRoute();

  const holySavingsList = useMemo(() => {
    let filteredList = [];

    filteredList = headerlessSection([]);
    return filteredList;
  }, []);

  const handleSelectAsset = useCallback(
    item => {
      setPointerEvents(false);
      onSelectSaving(item);
      delayNext();
      dangerouslyGetState().index = 1;
      navigate(Routes.MAIN_EXCHANGE_SCREEN);
    },
    [setPointerEvents, onSelectSaving, dangerouslyGetState, navigate]
  );

  const itemProps = useMemo(
    () => ({
      onPress: handleSelectAsset,
      showBalance: type === CurrencySelectionTypes.input,
      showFavoriteButton: type === CurrencySelectionTypes.output,
    }),
    [handleSelectAsset, type]
  );

  const [startInteraction] = useInteraction();
  useEffect(() => {
    // on new focus state
    if (isFocused !== prevIsFocused) {
      android && toggleGestureEnabled(!isFocused);
      startInteraction(() => {
        ios && toggleGestureEnabled(!isFocused);
      });
    }

    // on page blur
    if (!isFocused && prevIsFocused) {
      restoreFocusOnSwapModal?.();
    }
  }, [
    isFocused,
    startInteraction,
    prevIsFocused,
    restoreFocusOnSwapModal,
    toggleGestureEnabled,
  ]);

  const isFocusedAndroid = useIsFocused() && android;

  return (
    <Wrapper>
      <TabTransitionAnimation
        style={{
          opacity: android
            ? 1
            : interpolate(tabTransitionPosition, {
                extrapolate: Extrapolate.CLAMP,
                inputRange: [0, 1, 1],
                outputRange: [0, 1, 1],
              }),
          transform: [
            {
              translateX: android
                ? 0
                : interpolate(tabTransitionPosition, {
                    extrapolate: Animated.Extrapolate.CLAMP,
                    inputRange: [0, 1, 1],
                    outputRange: [8, 0, 0],
                  }),
            },
          ],
        }}
      >
        <Modal
          containerPadding={0}
          fullScreenOnAndroid
          height="100%"
          overflow="hidden"
          radius={30}
        >
          {isFocusedAndroid && <StatusBar barStyle="dark-content" />}
          <GestureBlocker type="top" />
          <Column flex={1}>
            <CurrencySelectModalHeader testID="currency-select-header" />
            {type === null || type === undefined ? null : (
              <CurrencySelectionList
                itemProps={itemProps}
                listItems={holySavingsList}
                loading={false}
                query={null}
                showList={isFocused}
                testID="currency-select-list"
                type={type}
              />
            )}
          </Column>
          <GestureBlocker type="bottom" />
        </Modal>
      </TabTransitionAnimation>
    </Wrapper>
  );
}
