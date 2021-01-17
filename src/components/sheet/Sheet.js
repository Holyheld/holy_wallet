import PropTypes from 'prop-types';
import React from 'react';
import { useSafeArea } from 'react-native-safe-area-context';
import { useDimensions } from '../../hooks';
import TouchableBackdrop from '../TouchableBackdrop';
import { Centered, Column } from '../layout';
import SheetHandle from './SheetHandle';
import { useNavigation } from '@holyheld-com/navigation';
import { borders, colors } from '@holyheld-com/styles';

const Sheet = ({
  borderRadius,
  children,
  hideHandle,
  backgroundColor = colors.modalHeader,
  handleColor = colors.handle,
}) => {
  const { width } = useDimensions();
  const { goBack } = useNavigation();
  const insets = useSafeArea();

  return (
    <Column height="100%" justify="end" width={width}>
      <TouchableBackdrop onPress={goBack} />
      <Column
        backgroundColor={backgroundColor}
        css={borders.buildRadius('top', borderRadius)}
        paddingBottom={insets.bottom}
        width="100%"
      >
        <Centered paddingBottom={7} paddingTop={6}>
          {!hideHandle && <SheetHandle color={handleColor} />}
        </Centered>
        {children}
      </Column>
    </Column>
  );
};

Sheet.propTypes = {
  borderRadius: PropTypes.number,
  children: PropTypes.node,
  hideHandle: PropTypes.bool,
};

Sheet.defaultProps = {
  borderRadius: 39,
};

export default Sheet;
