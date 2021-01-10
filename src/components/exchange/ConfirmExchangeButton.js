import React from 'react';
import ExchangeModalTypes from '../../helpers/exchangeModalTypes';
import { HoldToAuthorizeButton } from '../buttons';
import { SlippageWarningThresholdInBips } from './SlippageWarning';
import { colors } from '@rainbow-me/styles';

const ConfirmExchangeButtonShadows = [
  [0, 3, 5, colors.transparent, 0.2],
  [0, 6, 10, colors.transparent, 0.14],
  [0, 1, 18, colors.transparent, 0.12],
];

const ConfirmExchangeButton = ({
  disabled,
  isAuthorizing,
  isSufficientBalance,
  isSufficientGas,
  isSufficientLiquidity,
  onSubmit,
  slippage,
  testID,
  type,
  ...props
}) => {
  let label = '';
  switch (type) {
    case ExchangeModalTypes.deposit:
      label = 'Hold to Deposit';
      break;
    case ExchangeModalTypes.withdrawal:
      label = 'Hold to Withdraw';
      break;
    case ExchangeModalTypes.treasuryClaim:
      label = 'Hold to Claim & Burn';
      break;
    case ExchangeModalTypes.holyMigrate:
      label = 'Hold to Migrate';
      break;
    case ExchangeModalTypes.holyWithdraw:
      label = 'Hold to withdraw';
      break;
    case ExchangeModalTypes.holyDeposit:
      label = 'Hold to deposite';
      break;
    default:
      label = 'Hold to Swap';
  }

  if (!isSufficientBalance) {
    label = 'Insufficient Funds';
  } else if (!isSufficientLiquidity) {
    label = 'Insufficient Liquidity';
  } else if (!isSufficientGas) {
    label = 'Insufficient ETH';
  } else if (slippage > SlippageWarningThresholdInBips) {
    label = 'Swap Anyway';
  } else if (disabled) {
    label = 'Enter an Amount';
  }

  const isDisabled =
    disabled ||
    !isSufficientBalance ||
    !isSufficientGas ||
    !isSufficientLiquidity;

  return (
    <HoldToAuthorizeButton
      disabled={isDisabled}
      disabledBackgroundColor={colors.buttonDisabled}
      flex={1}
      hideInnerBorder
      isAuthorizing={isAuthorizing}
      label={label}
      onLongPress={onSubmit}
      shadows={ConfirmExchangeButtonShadows}
      testID={testID}
      theme="dark"
      {...props}
    />
  );
};

export default React.memo(ConfirmExchangeButton);
