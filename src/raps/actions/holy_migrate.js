import { Contract } from '@ethersproject/contracts';
import { captureException } from '@sentry/react-native';
import { get } from 'lodash';
import { toHex } from '../../handlers/web3';
import ProtocolTypes from '../../helpers/protocolTypes';
import TransactionStatusTypes from '../../helpers/transactionStatusTypes';
import TransactionTypes from '../../helpers/transactionTypes';
import { isZero } from '../../helpers/utilities';
import { loadWallet } from '../../model/wallet';
import { dataAddNewTransaction } from '../../redux/data';
import { rapsAddOrUpdate } from '../../redux/raps';
import store from '../../redux/store';
import { HOLY_PASSAGE_ABI, HOLY_PASSAGE_ADDRESS } from '../../references/holy';
import logger from 'logger';

const NOOP = () => undefined;

const holyMigrate = async (wallet, currentRap, index, parameters) => {
  logger.log('[holy migrate] start holy migrate!');
  const { accountAddress, amount, currency, selectedGasPrice } = parameters;
  const { dispatch } = store;

  let gasPrice = get(selectedGasPrice, 'value.amount');
  const gasLimit = 120000; // TODO: method in contract to estimate migration?

  let migration;

  const walletToUse = wallet || (await loadWallet());
  if (!walletToUse) return null;

  try {
    logger.sentry('[holy migrate] executing holy migration', {
      gasLimit,
      gasPrice,
    });

    const holyPassage = new Contract(
      HOLY_PASSAGE_ADDRESS,
      HOLY_PASSAGE_ABI,
      walletToUse
    );

    const transactionParams = {
      gasLimit: toHex(gasLimit) || undefined,
      gasPrice: toHex(gasPrice) || undefined,
    };

    migration = await holyPassage.migrate(transactionParams);
  } catch (e) {
    logger.sentry('[holy migrate] error executing holy migration');
    captureException(e);
    throw e;
  }

  logger.log('[holy migrate] response', migration);
  currentRap.actions[index].transaction.hash = migration.hash;
  dispatch(rapsAddOrUpdate(currentRap.id, currentRap));
  logger.log(
    '[holy migrate] adding a new holy migrate txn to migration',
    migration.hash
  );
  const newTransaction = {
    amount: amount,
    asset: currency,
    from: accountAddress,
    hash: migration.hash,
    nonce: get(migration, 'nonce'),
    protocol: ProtocolTypes.holy.name,
    status: TransactionStatusTypes.migrating,
    to: get(migration, 'to'),
    type: TransactionTypes.trade,
  };
  logger.log('[holy migrate] adding new txn', newTransaction);
  await dispatch(dataAddNewTransaction(newTransaction, accountAddress, true));
  logger.log('[holy migrate] calling the callback');
  currentRap.callback();
  currentRap.callback = NOOP;
  try {
    logger.log('[holy migrate] waiting for the holy migration to go thru');
    const receipt = await walletToUse.provider.waitForTransaction(
      migration.hash
    );
    logger.log('[holy migrate] receipt:', receipt);
    if (!isZero(receipt.status)) {
      currentRap.actions[index].transaction.confirmed = true;
      dispatch(rapsAddOrUpdate(currentRap.id, currentRap));
      logger.log('[holy migrate] updated raps');
      return;
    } else {
      logger.log('[holy migrate] status not success');
      currentRap.actions[index].transaction.confirmed = false;
      dispatch(rapsAddOrUpdate(currentRap.id, currentRap));
      return null;
    }
  } catch (error) {
    logger.log('[holy migrate] error waiting for holy migrate', error);
    currentRap.actions[index].transaction.confirmed = false;
    dispatch(rapsAddOrUpdate(currentRap.id, currentRap));
    return null;
  }
};

export default holyMigrate;
