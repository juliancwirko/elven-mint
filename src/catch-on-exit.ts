import process from 'process';

interface ProcessStateType {
  no: number; // number of the processed transaction, index of the loop + 1
  name: string; // name of the edition defined in metadata.json file
  txHash: string; // transaction hash of the transaction on chain
}

export class ProcessState {
  static processState: ProcessStateType;
  static set(data: ProcessStateType) {
    this.processState = data;
  }
  static get() {
    return this.processState;
  }
}

export const initCatchOnExit = () => {
  function exitHandler() {
    const state = ProcessState.get();
    console.log(' ');
    console.log('=======================');
    console.log(' ');
    console.log('elven-mint finished!');
    console.log('Last sent transaction: ', state || 'none');
    console.log(' ');
    console.log('=======================');
    console.log(' ');
  }

  //do something when app is closing
  process.on('exit', exitHandler);

  //catches ctrl+c event
  process.on('SIGINT', exitHandler);

  // catches "kill pid" (for example: nodemon restart)
  process.on('SIGUSR1', exitHandler);
  process.on('SIGUSR2', exitHandler);

  //catches uncaught exceptions
  process.on('uncaughtException', exitHandler);
};
