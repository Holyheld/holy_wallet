import { connect } from 'react-redux';
import { setOpenLPBonus } from '../redux/openStateSettings';

const mapStateToProps = ({ openStateSettings: { openLPBonus } }) => ({
  openLPBonus,
});

export default Component =>
  connect(mapStateToProps, { setOpenLPBonus })(Component);
