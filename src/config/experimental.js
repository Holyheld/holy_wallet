/**
 * This file contains flags for enabling features which are still in development.
 * While adding new functionality, please verify it against these features
 * keeping in mind that they should never be broken
 */

export const AVATAR_PICKER = 'avatarPicker';
export const DISCOVER_SHEET = 'discoverSheet';
export const REVIEW_ANDROID = 'reviewAndroid';
export const HOLY_SAVINGS = 'holySavings';
export const HOLY_TREASURY = 'holyTreasury';
export const HOLY_LP_BONUS_CLAIM = 'holyLPBonusClaim';

export const defaultConfig = {
  [AVATAR_PICKER]: ios,
  [DISCOVER_SHEET]: false,
  [HOLY_LP_BONUS_CLAIM]: false,
  [HOLY_SAVINGS]: false,
  [HOLY_TREASURY]: false,
  [REVIEW_ANDROID]: false,
};
