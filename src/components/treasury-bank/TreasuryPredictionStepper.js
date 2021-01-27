import PropTypes from 'prop-types';
import React, { useCallback, useMemo, useState } from 'react';
import styled from 'styled-components/primitives';
import { convertAmountToNativeDisplay } from '../../helpers/utilities';
import { magicMemo } from '../../utils';
import { ButtonPressAnimation } from '../animations';
import { Row, RowWithMargins } from '../layout';
import { AnimatedNumber, Emoji, Text } from '../text';
import { useAccountSettings } from '@holyheld-com/hooks';
import { colors, padding } from '@holyheld-com/styles';

const CrystalBallEmoji = styled(Emoji).attrs({
  name: 'crystal_ball',
  size: 'medium',
})`
  margin-bottom: 0.5;
`;

const PredictionNumber = styled(AnimatedNumber).attrs({
  color: colors.swapPurple,
  letterSpacing: 'roundedTight',
  size: 'lmedium',
  weight: 'semibold',
})`
  flex-grow: 1;
`;

/* eslint-disable sort-keys */
const steps = {
  'Monthly': {
    days: 30,
  },
  'Yearly': {
    days: 365,
  },
  '5-Year': {
    days: 365 * 5,
  },
  '10-Year': {
    days: 365 * 10,
  },
  '20-Year': {
    days: 365 * 20,
  },
  '50-Year': {
    days: 365 * 50,
  },
  '100-Year': {
    days: 365 * 100,
  },
};
/* eslint-enable sort-keys */

function useStepper(max, initial = 0) {
  const [step, setStep] = useState(initial);
  const nextStep = useCallback(() => setStep(p => (p + 1) % max), [max]);
  return [step, nextStep];
}

const TreasuryPredictionStepper = ({ dpyNativeAmount }) => {
  const { nativeCurrency } = useAccountSettings();
  const [step, nextStep] = useStepper(Object.keys(steps).length, 1);

  const predict = useMemo(
    () => Object.values(steps)[step].days * dpyNativeAmount,
    [step, dpyNativeAmount]
  );

  const formatter = useCallback(
    value => {
      return convertAmountToNativeDisplay(value, nativeCurrency);
    },
    [nativeCurrency]
  );

  return (
    <ButtonPressAnimation
      duration={120}
      onPress={nextStep}
      scaleTo={1.04}
      width="100%"
    >
      <Row align="center" css={padding(15, 19, 19)}>
        <RowWithMargins align="center" margin={5}>
          <CrystalBallEmoji />
          <Text size="lmedium">
            {`Est. ${Object.keys(steps)[step]} Earnings`}
          </Text>
        </RowWithMargins>
        <Row flex={1} justify="end">
          <PredictionNumber
            disableTabularNums
            formatter={formatter}
            steps={9}
            time={8}
            value={predict}
          />
        </Row>
      </Row>
    </ButtonPressAnimation>
  );
};

TreasuryPredictionStepper.propTypes = {
  dpyNativeAmount: PropTypes.string,
};

export default magicMemo(TreasuryPredictionStepper, ['dpyNativeAmount']);
