import { connect } from 'react-redux';
import { setOpenTokenMigration } from '../redux/openStateSettings';

const mapStateToProps = ({ openStateSettings: { openTokenMigration } }) => ({
  openTokenMigration,
});

export default Component =>
  connect(mapStateToProps, { setOpenTokenMigration })(Component);
