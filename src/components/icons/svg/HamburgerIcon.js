import * as React from 'react';
import { Path } from 'react-native-svg';
import Svg from '../Svg';
import { colors } from '@holyheld-com/styles';

function HamburgerIcon({
  color = colors.textColor,
  height = 10,
  width = 10,
  ...props
}) {
  return (
    <Svg height={height} viewBox="0 0 512 512" width={width} {...props}>
      <Path
        d="M464.883 64.267H47.117C21.137 64.267 0 85.403 0 111.416c0 25.98 21.137 47.117 47.117 47.117h417.766c25.98 0 47.117-21.137 47.117-47.117 0-26.013-21.137-47.149-47.117-47.149zM464.883 208.867H47.117C21.137 208.867 0 230.003 0 256.016c0 25.98 21.137 47.117 47.117 47.117h417.766c25.98 0 47.117-21.137 47.117-47.117 0-26.013-21.137-47.149-47.117-47.149zM464.883 353.467H47.117C21.137 353.467 0 374.604 0 400.616c0 25.98 21.137 47.117 47.117 47.117h417.766c25.98 0 47.117-21.137 47.117-47.117 0-26.012-21.137-47.149-47.117-47.149z"
        fill={color}
        fillRule="nonzero"
      />
    </Svg>
  );
}

export default HamburgerIcon;
