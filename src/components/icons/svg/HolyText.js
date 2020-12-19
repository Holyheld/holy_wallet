import PropTypes from 'prop-types';
import React from 'react';
import { Path } from 'react-native-svg';
import Svg from '../Svg';
import { colors } from '@rainbow-me/styles';

const HolyText = ({ color, ...props }) => (
  <Svg
    height={32}
    viewBox="0 0 504 48"
    width={125}
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      clipRule="evenodd"
      d="M11.773 27.977V48H0V0h11.773v18.651h32.103V0h11.773v48H43.876V27.977H11.773zm131.491-3.911C143.264 9.24 128.968 0 104.912 0 80.772 0 66.56 9.24 66.56 24.066c0 14.692 14.211 23.933 38.352 23.933 24.056 0 38.352-9.241 38.352-23.933zM104.636 9.04c-17.32 0-26.028 5.385-26.028 15.025 0 9.573 8.707 14.891 26.028 14.891 17.32 0 25.932-5.318 25.932-14.891 0-9.64-8.612-15.025-25.932-15.025zm91.596 29.633V48H153.52V0h11.773v38.674h30.939zM226.6 48V29.417L249.394 0h-13.827l-14.58 19.406L206.613 0h-14.511l22.656 29.074V48H226.6zm44.537-20.023V48h-11.773V0h11.773v18.651h32.103V0h11.773v48H303.24V27.977h-32.103zM379.058 48v-8.983H343.67v-11.04h24.279v-8.914H343.67V8.983h35.388V0h-46.956v48h46.956zm56.311-9.326V48h-42.712V0h11.773v38.674h30.939zM476.415 48C494.075 48 504 39.154 504 24.137 504 8.983 494.075 0 476.415 0h-28.611v48h28.611zm-16.838-9.326h17.317c9.925 0 14.991-5.211 14.991-14.537 0-9.531-5.066-14.811-14.991-14.811h-17.317v29.348z"
      fill={color}
      fillRule="evenodd"
    />
  </Svg>
);

HolyText.propTypes = {
  color: PropTypes.string,
};

HolyText.defaultProps = {
  color: colors.black,
};

export default HolyText;
