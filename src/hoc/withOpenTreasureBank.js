import { connect } from 'react-redux';
import { setOpenTreasureBank } from '../redux/openStateSettings';

const mapStateToProps = ({ openStateSettings: { openTreasureBank } }) => ({
  openTreasureBank,
});

export default Component =>
  connect(mapStateToProps, { setOpenTreasureBank })(Component);
