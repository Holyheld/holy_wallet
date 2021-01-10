import { PropTypes } from 'prop-types';
import React, { useCallback } from 'react';
import { FlatList } from 'react-native';
import colors from '../../styles/colors';
import ListItem from './ListItem';
import ListItemDivider from './ListItemDivider';

const getListItemLayout = (data, index) => ({
  index,
  length: ListItem.height,
  offset: ListItem.height * index,
});

const List = ({
  getItemLayout,
  items,
  renderItem,
  dividerBackgroundColor = colors.pageBackground,
  dividerColor = colors.divider,
  ...props
}) => {
  const dividerRenderer = useCallback(
    () => (
      <ListItemDivider
        backgroundColor={dividerBackgroundColor}
        color={dividerColor}
      />
    ),
    [dividerBackgroundColor, dividerColor]
  );

  return (
    <FlatList
      ItemSeparatorComponent={dividerRenderer}
      data={items}
      getItemLayout={getItemLayout}
      removeClippedSubviews
      renderItem={renderItem}
      scrollEventThrottle={16}
      {...props}
    />
  );
};

List.propTypes = {
  getItemLayout: PropTypes.func.isRequired,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
    })
  ).isRequired,
  renderItem: PropTypes.func.isRequired,
};

List.defaultProps = {
  getItemLayout: getListItemLayout,
};

export default List;
