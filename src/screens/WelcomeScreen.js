import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet } from 'react-native';
import { IS_TESTING } from 'react-native-dotenv';
import Reanimated from 'react-native-reanimated';
import { useValue } from 'react-native-redash';
import styled from 'styled-components/native';
import { useMemoOne } from 'use-memo-one';
import HolyGlassOrange from '../assets/holys/glass-orange.png';
import HolyGlassRainbow from '../assets/holys/glass-rainbow.png';
import HolyNeonRainbow from '../assets/holys/neon-rainbow.png';
import HolyNeon from '../assets/holys/neon.png';
import HolyWhite from '../assets/holys/white.png';
import { ButtonPressAnimation } from '../components/animations';
import HolyText from '../components/icons/svg/HolyText';
import { RowWithMargins } from '../components/layout';
import { Emoji, Text } from '../components/text';

import {
  fetchUserDataFromCloud,
  isCloudBackupAvailable,
} from '../handlers/cloudBackup';
import { cloudPlatform } from '../utils/platform';

import { useHideSplashScreen } from '@holyheld-com/hooks';
import { useNavigation } from '@holyheld-com/navigation';
import Routes from '@holyheld-com/routes';
import { colors, shadow } from '@holyheld-com/styles';
import logger from 'logger';

const ButtonContainer = styled(Reanimated.View)`
  border-radius: ${({ height }) => height / 2};
`;

const ButtonContent = styled(RowWithMargins).attrs({
  align: 'center',
  margin: 4,
})`
  align-self: center;
  height: 100%;
  padding-bottom: 4;
`;

const ButtonLabel = styled(Text).attrs(
  ({ textColor: color = colors.dark }) => ({
    align: 'center',
    color,
    size: 'larger',
    weight: 'bold',
  })
)``;

const ButtonEmoji = styled(Emoji).attrs({
  align: 'center',
  size: 16.25,
})`
  padding-bottom: 1.5px;
`;

const DarkShadow = styled(Reanimated.View)`
  ${shadow.build(0, 10, 30, colors.dark, 1)};
  background-color: ${colors.white};
  border-radius: 30;
  height: 60;
  left: -3;
  opacity: 0.2;
  position: absolute;
  top: -3;
  width: 236;
`;

const Shadow = styled(Reanimated.View)`
  ${shadow.build(0, 5, 15, colors.dark, 0.4)};
  border-radius: 30;
  height: 60;
  left: -3;
  position: absolute;
  top: -3;
  width: 236;
`;

const RainbowButton = ({
  darkShadowStyle,
  emoji,
  height,
  onPress,
  shadowStyle,
  style,
  textColor,
  text,
  ...props
}) => {
  return (
    <ButtonPressAnimation
      onPress={onPress}
      radiusAndroid={height / 2}
      scaleTo={0.9}
      {...props}
    >
      {ios && <DarkShadow style={darkShadowStyle} />}
      {ios && <Shadow style={shadowStyle} />}
      <ButtonContainer height={height} style={style}>
        <ButtonContent>
          {!!emoji && <ButtonEmoji name={emoji} />}
          <ButtonLabel textColor={textColor}>{text}</ButtonLabel>
        </ButtonContent>
      </ButtonContainer>
    </ButtonPressAnimation>
  );
};

const Container = styled.View`
  ${StyleSheet.absoluteFillObject};
  align-items: center;
  background-color: ${colors.welcomeScreenBackground};
  justify-content: center;
`;

const ContentWrapper = styled(Animated.View)`
  align-items: center;
  height: 192;
  justify-content: space-between;
  margin-bottom: 20;
  z-index: 10;
`;

const ButtonWrapper = styled(Animated.View)`
  width: 100%;
`;

const INITIAL_SIZE = 375;

export const useAnimatedValue = initialValue => {
  const value = useRef();

  if (!value.current) {
    value.current = new Animated.Value(initialValue);
  }

  return value;
};

const images = [
  {
    delay: 0,
    id: 'neon-rainbow',
    rotate: '0deg',
    scale: 0.4,
    source: ios ? { uri: 'neon-rainbow' } : HolyNeonRainbow,
    x: -110,
    y: -202,
  },
  {
    delay: 20,
    id: 'white',
    rotate: '0deg',
    scale: 0.29,
    source: ios ? { uri: 'white' } : HolyWhite,
    x: 135,
    y: 342,
  },
  {
    delay: 40,
    id: 'glass-orange',
    rotate: '0deg',
    scale: 0.4,
    source: ios ? { uri: 'glass-orange' } : HolyGlassOrange,
    x: 160,
    y: -250,
  },
  {
    delay: 60,
    id: 'glass-rainbow',
    rotate: '-360deg',
    scale: 0.2826666667,
    source: ios ? { uri: 'glass-rainbow' } : HolyGlassRainbow,
    x: -180,
    y: 180,
  },
  {
    delay: 80,
    id: 'neon',
    rotate: '360deg',
    scale: 0.3,
    source: ios ? { uri: 'neon' } : HolyNeon,
    x: 55,
    y: 200,
  },
];

const traversedImages = images.map(
  (
    {
      delay,
      initialRotate = '0deg',
      rotate = '0deg',
      scale = 1,
      source,
      x = 0,
      y = 0,
    },
    index
  ) => {
    const animatedValue = new Animated.Value(0);
    return {
      delay,
      id: index,
      source,
      style: {
        opacity: animatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 1],
        }),
        transform: [
          {
            translateX: animatedValue.interpolate({
              inputRange: [0, 1],
              outputRange: [0, x],
            }),
          },
          {
            translateY: animatedValue.interpolate({
              inputRange: [0, 1],
              outputRange: [0, y],
            }),
          },
          {
            rotate: animatedValue.interpolate({
              inputRange: [0, 1],
              outputRange: [initialRotate, rotate],
            }),
          },
          {
            scale: animatedValue.interpolate({
              inputRange: [0, 1],
              outputRange: [0, scale],
            }),
          },
        ],
      },
      value: animatedValue,
    };
  }
);

const Image = styled(Animated.Image)`
  height: ${INITIAL_SIZE};
  position: absolute;
  width: ${INITIAL_SIZE};
`;

const springConfig = {
  bounciness: 7.30332,
  speed: 0.6021408,
  toValue: 1,
  useNativeDriver: true,
};

export default function WelcomeScreen() {
  const { replace, navigate } = useNavigation();
  const contentAnimation = useAnimatedValue(1);
  const hideSplashScreen = useHideSplashScreen();
  const createWalletButtonAnimation = useAnimatedValue(1);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        logger.log(`downloading ${cloudPlatform} backup info...`);
        const isAvailable = await isCloudBackupAvailable();
        if (isAvailable && ios) {
          const data = await fetchUserDataFromCloud();
          setUserData(data);
          logger.log(`Downloaded ${cloudPlatform} backup info`);
        }
      } catch (e) {
        logger.log('error getting userData', e);
      } finally {
        hideSplashScreen();
        Animated.parallel([
          ...traversedImages.map(({ value, delay = 0 }) =>
            Animated.spring(value, { ...springConfig, delay })
          ),
          Animated.sequence([
            Animated.timing(contentAnimation.current, {
              duration: 120,
              easing: Easing.bezier(0.165, 0.84, 0.44, 1),
              toValue: 1.2,
            }),
            Animated.spring(contentAnimation.current, {
              friction: 8,
              tension: 100,
              toValue: 1,
            }),
          ]),
          // We need to disable looping animations
          // There's no way to disable sync yet
          // See https://stackoverflow.com/questions/47391019/animated-button-block-the-detox
          IS_TESTING !== 'true' &&
            Animated.loop(
              Animated.sequence([
                Animated.timing(createWalletButtonAnimation.current, {
                  duration: 1000,
                  toValue: 1.02,
                  useNativeDriver: true,
                }),
                Animated.timing(createWalletButtonAnimation.current, {
                  duration: 1000,
                  toValue: 0.98,
                  useNativeDriver: true,
                }),
              ])
            ),
        ]).start();
        if (IS_TESTING === 'true') {
          logger.log(
            'Disabled loop animations in WelcomeScreen due to .env var IS_TESTING === "true"'
          );
        }
      }
    };
    initialize();

    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      createWalletButtonAnimation.current.setValue(1);
      // eslint-disable-next-line react-hooks/exhaustive-deps
      contentAnimation.current.setValue(1);
    };
  }, [contentAnimation, hideSplashScreen, createWalletButtonAnimation]);

  // const buttonStyle = useMemoOne(
  //   () => ({
  //     transform: [{ scale: createWalletButtonAnimation.current }],
  //     zIndex: 10,
  //   }),
  //   [createWalletButtonAnimation]
  // );

  const contentStyle = useMemoOne(
    () => ({
      transform: [
        {
          scale: contentAnimation.current,
        },
      ],
    }),
    [createWalletButtonAnimation]
  );

  const rValue = useValue(0);

  const onCreateWallet = useCallback(async () => {
    replace(Routes.SWIPE_LAYOUT, {
      params: { emptyWallet: true },
      screen: Routes.WALLET_SCREEN,
    });
  }, [replace]);

  const createWalletButtonProps = useMemoOne(() => {
    return {
      darkShadowStyle: {
        opacity: 0,
      },
      emoji: 'luggage',
      height: 50,
      shadowStyle: {
        opacity: 0,
      },
      style: {
        backgroundColor: colors.buttonPrimary,
        width: 248,
      },
      text: 'Get a new wallet',
      textColor: colors.textColorPrimaryButton,
    };
  }, [rValue]);

  const showRestoreSheet = useCallback(() => {
    navigate(Routes.RESTORE_SHEET, {
      userData,
    });
  }, [navigate, userData]);

  const existingWalletButtonProps = useMemoOne(() => {
    return {
      darkShadowStyle: {
        opacity: 0,
      },
      emoji: 'key',
      height: 50,
      shadowStyle: {
        opacity: 0,
      },
      style: {
        backgroundColor: colors.buttonSecondary,
        width: 248,
      },
      text: 'I already have one',
      textColor: colors.textColor,
    };
  }, [rValue]);

  return (
    <Container testID="welcome-screen">
      {traversedImages.map(({ source, style, id }) => (
        <Image key={`holy${id}`} source={source} style={style} />
      ))}

      <ContentWrapper style={contentStyle}>
        <HolyText color={colors.textColor} height={50} width={200} />
        <ButtonWrapper>
          <RainbowButton
            onPress={onCreateWallet}
            testID="new-wallet-button"
            {...createWalletButtonProps}
          />
        </ButtonWrapper>
        <ButtonWrapper>
          <RainbowButton
            onPress={showRestoreSheet}
            {...existingWalletButtonProps}
            testID="already-have-wallet-button"
          />
        </ButtonWrapper>
      </ContentWrapper>
    </Container>
  );
}
