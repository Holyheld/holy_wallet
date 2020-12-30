import { connect } from 'react-redux';
import { setOpenTreasuryBank } from '../redux/openStateSettings';

const mapStateToProps = ({ openStateSettings: { openTreasuryBank } }) => ({
  openTreasuryBank,
});

export default Component =>
  connect(mapStateToProps, { setOpenTreasuryBank })(Component);
