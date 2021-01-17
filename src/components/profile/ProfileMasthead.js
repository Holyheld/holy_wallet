import Clipboard from '@react-native-community/clipboard';
import { find, get } from 'lodash';
import React, { useCallback, useMemo, useRef } from 'react';
import ImagePicker from 'react-native-image-crop-picker';
import { useDispatch } from 'react-redux';
import styled from 'styled-components/primitives';
import { walletsSetSelected, walletsUpdate } from '../../redux/wallets';
import { HOLY_V1_ADDRESS } from '../../references/holy';
import Divider from '../Divider';
import { Alert } from '../alerts';
import { ButtonPressAnimation } from '../animations';
import { RainbowButton } from '../buttons';
import RainbowButtonTypes from '../buttons/rainbow-button/RainbowButtonTypes';
import { FloatingEmojis } from '../floating-emojis';
import { Icon } from '../icons';
import { Centered, Column, Row, RowWithMargins } from '../layout';
import { TruncatedText } from '../text';
import AvatarCircle from './AvatarCircle';
import ProfileAction from './ProfileAction';
import useExperimentalFlag, {
  AVATAR_PICKER,
} from '@holyheld-com/config/experimentalHooks';
import showWalletErrorAlert from '@holyheld-com/helpers/support';
import {
  useAccountProfile,
  useAccountSettings,
  useAsset,
  useDimensions,
  useWallets,
  //useWalletSectionsData,
} from '@holyheld-com/hooks';
import { useNavigation } from '@holyheld-com/navigation';
import Routes from '@holyheld-com/routes';
import { colors } from '@holyheld-com/styles';
import { abbreviations, showActionSheetWithOptions } from '@holyheld-com/utils';

const dropdownArrowWidth = 21;

const FloatingEmojisRegion = styled(FloatingEmojis).attrs({
  distance: 250,
  duration: 500,
  fadeOut: false,
  scaleTo: 0,
  size: 50,
  wiggleFactor: 0,
})`
  height: 0;
  left: 0;
  position: absolute;
  top: 0;
  width: 130;
`;

const AccountName = styled(TruncatedText).attrs({
  align: 'left',
  firstSectionLength: abbreviations.defaultNumCharsPerSection,
  letterSpacing: 'roundedMedium',
  size: 'bigger',
  truncationLength: 4,
  weight: 'bold',
})`
  height: ${android ? '38' : '33'};
  margin-top: ${android ? '-10' : '-1'};
  margin-bottom: ${android ? '10' : '1'};
  max-width: ${({ deviceWidth }) => deviceWidth - dropdownArrowWidth - 60};
  padding-right: 6;
`;

const MigrateButton = styled(RainbowButton).attrs({
  label: 'Migrate Holy',
  overflowMargin: 30,
  skipTopMargin: true,
  width: 200,
})`
  margin-top: 16;
`;

const DropdownArrow = styled(Centered)`
  height: 9;
  margin-top: 11;
  width: ${dropdownArrowWidth};
`;

const ProfileMastheadDivider = styled(Divider).attrs({
  background: colors.pageBackground,
  color: colors.divider,
})`
  bottom: 0;
  position: absolute;
`;

export default function ProfileMasthead({
  recyclerListRef,
  showBottomDivider = true,
}) {
  const { wallets, selectedWallet, isDamaged, isReadOnlyWallet } = useWallets();
  const { network } = useAccountSettings();

  const holyCoinV1 = {
    address: HOLY_V1_ADDRESS(network), // from testnet
    type: 'token',
  };

  const holyV1Asset = useAsset(holyCoinV1);

  const isMigrationButton = useMemo(() => {
    const holyV1Balance = get(holyV1Asset, 'balance.amount', '0');
    return holyV1Balance !== '0';
  }, [holyV1Asset]);

  const onNewEmoji = useRef();
  const setOnNewEmoji = useCallback(
    newOnNewEmoji => (onNewEmoji.current = newOnNewEmoji),
    []
  );
  const { width: deviceWidth } = useDimensions();
  const dispatch = useDispatch();
  const { navigate } = useNavigation();
  const {
    accountAddress,
    accountColor,
    accountSymbol,
    accountName,
    accountImage,
  } = useAccountProfile();
  const isAvatarPickerAvailable = useExperimentalFlag(AVATAR_PICKER);
  const isAvatarEmojiPickerEnabled = true;
  const isAvatarImagePickerEnabled = true;

  const onRemovePhoto = useCallback(async () => {
    const newWallets = { ...wallets };
    const newWallet = newWallets[selectedWallet.id];
    const account = find(newWallet.addresses, ['address', accountAddress]);

    account.image = null;
    newWallet.addresses[account.index] = account;

    dispatch(walletsSetSelected(newWallet));
    await dispatch(walletsUpdate(newWallets));
  }, [dispatch, selectedWallet, accountAddress, wallets]);

  const handlePressAvatar = useCallback(() => {
    recyclerListRef?.scrollToTop(true);
    setTimeout(
      () => {
        if (isAvatarImagePickerEnabled) {
          const processPhoto = image => {
            const stringIndex = image?.path.indexOf('/tmp');
            const newWallets = { ...wallets };
            const walletId = selectedWallet.id;
            newWallets[walletId].addresses.some((account, index) => {
              newWallets[walletId].addresses[index].image = ios
                ? `~${image?.path.slice(stringIndex)}`
                : image?.path;
              dispatch(walletsSetSelected(newWallets[walletId]));
              return true;
            });
            dispatch(walletsUpdate(newWallets));
          };

          const avatarActionSheetOptions = [
            'Take Photo',
            'Choose from Library',
            ...(isAvatarPickerAvailable ? ['Pick an Emoji'] : []),
            ...(accountImage ? ['Remove Photo'] : []),
            ...(ios ? ['Cancel'] : []),
          ];

          showActionSheetWithOptions(
            {
              cancelButtonIndex: avatarActionSheetOptions.length - 1,
              destructiveButtonIndex: accountImage
                ? avatarActionSheetOptions.length - 2
                : undefined,
              options: avatarActionSheetOptions,
            },
            async buttonIndex => {
              if (buttonIndex === 0) {
                ImagePicker.openCamera({
                  cropperCircleOverlay: true,
                  cropping: true,
                }).then(processPhoto);
              } else if (buttonIndex === 1) {
                ImagePicker.openPicker({
                  cropperCircleOverlay: true,
                  cropping: true,
                }).then(processPhoto);
              } else if (buttonIndex === 2 && isAvatarEmojiPickerEnabled) {
                navigate(Routes.AVATAR_BUILDER, {
                  initialAccountColor: accountColor,
                  initialAccountName: accountName,
                });
              } else if (buttonIndex === 3 && accountImage) {
                onRemovePhoto();
              }
            }
          );
        } else if (isAvatarEmojiPickerEnabled) {
          navigate(Routes.AVATAR_BUILDER, {
            initialAccountColor: accountColor,
            initialAccountName: accountName,
          });
        }
      },
      recyclerListRef?.getCurrentScrollOffset() > 0 ? 200 : 1
    );
  }, [
    accountColor,
    accountImage,
    accountName,
    dispatch,
    isAvatarEmojiPickerEnabled,
    isAvatarImagePickerEnabled,
    isAvatarPickerAvailable,
    navigate,
    onRemovePhoto,
    recyclerListRef,
    selectedWallet.id,
    wallets,
  ]);

  const handlePressReceive = useCallback(() => {
    if (isDamaged) {
      showWalletErrorAlert();
      return;
    }
    navigate(Routes.RECEIVE_MODAL);
  }, [navigate, isDamaged]);

  const handleMigrateHoly = useCallback(() => {
    if (!isReadOnlyWallet) {
      navigate(Routes.HOLY_MIGRATE_MODAL, {
        holyV1Asset,
      });
    } else {
      Alert.alert(`You need to import the wallet in order to do this`);
    }
  }, [navigate, isReadOnlyWallet, holyV1Asset]);

  const handlePressChangeWallet = useCallback(() => {
    navigate(Routes.CHANGE_WALLET_SHEET);
  }, [navigate]);

  const handlePressCopyAddress = useCallback(() => {
    if (isDamaged) {
      showWalletErrorAlert();
    }
    if (onNewEmoji && onNewEmoji.current) {
      onNewEmoji.current();
    }
    Clipboard.setString(accountAddress);
  }, [accountAddress, isDamaged]);

  return (
    <Column align="center" height={260} marginBottom={24} marginTop={0}>
      <AvatarCircle
        accountColor={accountColor}
        accountSymbol={accountSymbol}
        image={accountImage}
        isAvatarPickerAvailable={isAvatarPickerAvailable}
        onPress={handlePressAvatar}
      />
      <ButtonPressAnimation onPress={handlePressChangeWallet}>
        <Row>
          <AccountName deviceWidth={deviceWidth}>{accountName}</AccountName>
          <DropdownArrow>
            <Icon color={colors.textColor} direction="down" name="caret" />
          </DropdownArrow>
        </Row>
      </ButtonPressAnimation>
      <RowWithMargins align="center" margin={19}>
        <ProfileAction
          icon="copy"
          onPress={handlePressCopyAddress}
          radiusWrapperStyle={{ marginRight: 10, width: 150 }}
          scaleTo={0.88}
          text="Copy Address"
          width={127}
          wrapperProps={{
            containerStyle: {
              alignItems: 'flex-start',
              justifyContent: 'flex-start',
              paddingLeft: 10,
            },
          }}
        />
        <FloatingEmojisRegion setOnNewEmoji={setOnNewEmoji} />
        <ProfileAction
          icon="qrCode"
          onPress={handlePressReceive}
          radiusWrapperStyle={{ marginRight: 10, width: 104 }}
          scaleTo={0.88}
          text="Receive"
          width={81}
          wrapperProps={{
            containerStyle: {
              alignItems: 'flex-start',
              justifyContent: 'flex-start',
              paddingLeft: 10,
            },
          }}
        />
      </RowWithMargins>

      <MigrateButton
        disabled={!isMigrationButton}
        onPress={handleMigrateHoly}
        type={RainbowButtonTypes.addCash}
      />

      {showBottomDivider && <ProfileMastheadDivider />}
    </Column>
  );
}
