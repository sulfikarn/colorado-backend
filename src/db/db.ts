import mongoose from 'mongoose';
import {MONGO_DB} from '../constants';

let connection: mongoose.Connection;

/**
 * Function to set mongodb connection
 */
export async function connectionPool() {
  // add your own uri below
  try {
    if (connection) {
      console.log('Existing connection found. Re using it');
      return connection;
    }
    console.log(`Connecting to Database`);
    await mongoose.connect(MONGO_DB, {
      useNewUrlParser: true,
      useFindAndModify: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
    console.log('Connected to database');
    connection = mongoose.connection;
    return connection;
  } catch (err) {
    console.log('Could not connect to database=', err);
    // eslint-disable-next-line no-undef
    process.exit(1);
  }
};
export const disconnect = () => {
  if (!connection) {
    console.log('Gracefully shutting the server down');
    return;
  }
  console.log('Gracefully closing connection and shutting the server down');
  mongoose.disconnect();
};
