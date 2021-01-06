import { useIsFocused, useRoute } from '@react-navigation/native';
import { toLower } from 'lodash';
import matchSorter from 'match-sorter';
import React, {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { StatusBar } from 'react-native';
import Animated, { Extrapolate } from 'react-native-reanimated';
import styled from 'styled-components/primitives';
import GestureBlocker from '../components/GestureBlocker';
import { interpolate } from '../components/animations';
import {
  CurrencySelectionList,
  CurrencySelectModalHeader,
  ExchangeSearch,
} from '../components/exchange';
import { Column, KeyboardFixedOpenLayout } from '../components/layout';
import { Modal } from '../components/modal';
import { addHexPrefix } from '../handlers/web3';
import CurrencySelectionTypes from '../helpers/currencySelectionTypes';
import { useHolySavingsWithBalance } from '../hooks/useHolySavings';
import { delayNext } from '../hooks/useMagicAutofocus';
import { useNavigation } from '../navigation/Navigation';
import {
  useInteraction,
  useMagicAutofocus,
  usePrevious,
  useTimeout,
} from '@rainbow-me/hooks';
import Routes from '@rainbow-me/routes';
import { position } from '@rainbow-me/styles';
import { filterList } from '@rainbow-me/utils';

const TabTransitionAnimation = styled(Animated.View)`
  ${position.size('100%')};
`;

const headerlessSection = data => [{ data, title: '' }];
const Wrapper = ios ? KeyboardFixedOpenLayout : Fragment;

const searchCurrencyList = (searchList, query) => {
  const isAddress = query.match(/^(0x)?[0-9a-fA-F]{40}$/);

  if (isAddress) {
    const formattedQuery = toLower(addHexPrefix(query));
    return filterList(searchList, formattedQuery, ['address'], {
      threshold: matchSorter.rankings.CASE_SENSITIVE_EQUAL,
    });
  }

  return filterList(searchList, query, ['symbol', 'name'], {
    threshold: matchSorter.rankings.CONTAINS,
  });
};

export default function HolySavingsSelectModal() {
  const isFocused = useIsFocused();
  const prevIsFocused = usePrevious(isFocused);
  const { navigate, dangerouslyGetState } = useNavigation();
  const {
    params: {
      onSelectCurrency,
      restoreFocusOnSwapModal,
      setPointerEvents,
      tabTransitionPosition,
      toggleGestureEnabled,
      type,
    },
  } = useRoute();

  const searchInputRef = useRef();
  const { handleFocus } = useMagicAutofocus(searchInputRef, undefined, true);

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchQueryForSearch, setSearchQueryForSearch] = useState('');

  const savings = useHolySavingsWithBalance();

  const holySavingsList = useMemo(() => {
    let filteredList = [];
    if (type === CurrencySelectionTypes.input) {
      filteredList = headerlessSection(savings);
      if (searchQueryForSearch) {
        filteredList = searchCurrencyList(savings, searchQueryForSearch);
        filteredList = headerlessSection(filteredList);
      }
    } else if (type === CurrencySelectionTypes.output) {
      filteredList = headerlessSection(savings);
      if (searchQueryForSearch) {
        filteredList = searchCurrencyList(savings, searchQueryForSearch);
        filteredList = headerlessSection(filteredList);
      } else {
        filteredList = headerlessSection(filteredList);
      }
    }
    setIsSearching(false);
    return filteredList;
  }, [searchQueryForSearch, type, savings]);

  const [startQueryDebounce, stopQueryDebounce] = useTimeout();
  useEffect(() => {
    stopQueryDebounce();
    startQueryDebounce(
      () => {
        setIsSearching(true);
        setSearchQueryForSearch(searchQuery);
      },
      searchQuery === '' ? 1 : 250
    );
  }, [searchQuery, startQueryDebounce, stopQueryDebounce]);

  const handleSelectAsset = useCallback(
    item => {
      setPointerEvents(false);
      onSelectCurrency(item);
      delayNext();
      dangerouslyGetState().index = 1;
      navigate(Routes.MAIN_EXCHANGE_SCREEN);
    },
    [setPointerEvents, onSelectCurrency, dangerouslyGetState, navigate]
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
      setSearchQuery('');
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
            <ExchangeSearch
              isFetching={false}
              isSearching={isSearching}
              onChangeText={setSearchQuery}
              onFocus={handleFocus}
              ref={searchInputRef}
              searchQuery={searchQuery}
              testID="currency-select-search"
            />
            {type === null || type === undefined ? null : (
              <CurrencySelectionList
                itemProps={itemProps}
                listItems={holySavingsList}
                loading={false}
                query={searchQueryForSearch}
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
