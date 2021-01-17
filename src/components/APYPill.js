import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import styled from 'styled-components/primitives';
import { Centered } from './layout';

import { GradientText } from './text';
import { colors, position } from '@holyheld-com/styles';

const sx = StyleSheet.create({
  container: {
    height: 30,
    paddingBottom: 1,
    paddingHorizontal: 10,
  },
  containerSmall: {
    height: 21,
    paddingHorizontal: 6,
    transform: [{ translateX: -6 }],
  },
});

const textProps = {
  end: { x: 1, y: 1 },
  start: { x: 0, y: 0 },
  steps: [0, 1],
};

const TextContainer = styled(View).attrs(({ borderRadius }) => ({
  ...position.coverAsObject,
  backgroundColor: colors.apyPillBackground,
  borderRadius,
  overflow: 'hidden',
}))``;

function APYPill({ small, value, postfix = '% APY' }) {
  return (
    <Centered style={small ? sx.containerSmall : sx.container}>
      {small ? (
        <TextContainer borderRadius={21} />
      ) : (
        <TextContainer borderRadius={17} />
      )}
      <GradientText
        {...textProps}
        align="center"
        angle={false}
        letterSpacing="roundedTight"
        size={small ? 'smedium' : 'lmedium'}
        weight="semibold"
      >
        {value}
        {postfix}
      </GradientText>
    </Centered>
  );
}

APYPill.propTypes = {
  postfix: PropTypes.string,
  small: PropTypes.bool,
  value: PropTypes.node,
};

export default React.memo(APYPill);
