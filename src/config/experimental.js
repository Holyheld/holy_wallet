/**
 * This file contains flags for enabling features which are still in development.
 * While adding new functionality, please verify it against these features
 * keeping in mind that they should never be broken
 */

export const AVATAR_PICKER = 'avatarPicker';
export const DISCOVER_SHEET = 'discoverSheet';
export const REVIEW_ANDROID = 'reviewAndroid';
export const REVIEW_IOS = 'reviewIOS';
export const REVIEW_AVAILABLE = 'reviewAvailable';

export const defaultConfig = {
  [AVATAR_PICKER]: ios,
  [DISCOVER_SHEET]: false,
  [REVIEW_ANDROID]: false,
  [REVIEW_AVAILABLE]: false,
  [REVIEW_IOS]: false,
};

defaultConfig[REVIEW_AVAILABLE] =
  (ios && defaultConfig[REVIEW_IOS]) ||
  (android && defaultConfig[REVIEW_ANDROID]);

export const USE_HOLY_SWAP = true;

// all tokens are valid now
// keep function for next generation
export const isTokenValidForSwap = () => !USE_HOLY_SWAP || true;
