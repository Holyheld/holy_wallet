/**
 * This file contains flags for enabling features which are still in development.
 * While adding new functionality, please verify it against these features
 * keeping in mind that they should never be broken
 */

export const AVATAR_PICKER = 'avatarPicker';
export const DISCOVER_SHEET = 'discoverSheet';
export const REVIEW_ANDROID = 'reviewAndroid';

export const defaultConfig = {
  [AVATAR_PICKER]: ios,
  [DISCOVER_SHEET]: false,
  [REVIEW_ANDROID]: false,
};

export const USE_HOLY_SWAP = true;

export const isTokenValidForSwap = address =>
  !USE_HOLY_SWAP ||
  (address !== 'eth' &&
    address !== '0xdac17f958d2ee523a2206206994597c13d831ec7');
