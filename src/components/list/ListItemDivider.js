import { PropTypes } from 'prop-types';
import React from 'react';
import { withNeverRerender } from '../../hoc';
import Divider from '../Divider';
import { colors } from '@holyheld-com/styles';

const ListItemDivider = ({
  inset,
  color = colors.divider,
  backgroundColor = colors.pageBackground,
}) => (
  <Divider backgroundColor={backgroundColor} color={color} inset={[0, inset]} />
);

ListItemDivider.propTypes = {
  inset: PropTypes.number,
};

ListItemDivider.defaultProps = {
  inset: 16,
};

export default withNeverRerender(ListItemDivider);
