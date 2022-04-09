import { SensorDecodedValue } from "../data/SensorDecodedValue";
import { SensorReadResult } from "../data/SensorReadResult";
import { SerialDecoder } from "./SerialDecoder";
import { SENSOR_VALUE, SerialRawValue } from "./SerialRawValue";
import Timeout = NodeJS.Timeout;

const MAX_MS_WAIT_FOR_DATA_READY: number = 20000;
const INTERVAL_MS = 1000;
const MAX_PERCENTAGE = 100;

export class VOCSerialDecoder extends SerialDecoder {

  private _hasStartedWaitingForData: boolean = false;
  private _dataReadyPercentage: number = 0;
  private _dataReadyIntervalId: Timeout | undefined;
  private _incrementPercentage: number;

  constructor() {
    super();

    this._incrementPercentage = INTERVAL_MS * MAX_PERCENTAGE / MAX_MS_WAIT_FOR_DATA_READY;
  }

  async decode(rawValues: SerialRawValue[]): Promise<SensorReadResult | null> {
    if (!rawValues.length) {
      throw new Error('invlalid input. expected 1 value at least')
    }

    const rawValue = rawValues[0];

    if (!rawValue.isValidLength) {
      this._log(`invalid length ${rawValue.rawValue.length}. skipping..`);
      return null;
    }

    if (!this._hasStartedWaitingForData) {
      this.startIntervalForDataReady();
    }

    const data0f = rawValue.getTwoBytesByIndex(6);

    if (data0f > 0) {
      this.clearIntervalIfRunning();
    }

    const data: VocResult = {
      status: this._dataReadyPercentage !== MAX_PERCENTAGE ? VOC_RESULT_STATUS.PROCESSING : VOC_RESULT_STATUS.READY,
      dataReadyPercentage: this._dataReadyPercentage,
      value: data0f
    }

    const value0: SensorDecodedValue = { label: SENSOR_VALUE.VOC, value: data, type: "object" };

    const result: SensorReadResult = {
      sensorType: rawValue.sensorType,
      decodedValues: [value0]
    };

    return result;
  }

  private clearIntervalIfRunning() {
    if (!this._dataReadyIntervalId) {
      return;
    }

    this._log('clearIntervalIfRunning');
    clearInterval(this._dataReadyIntervalId);
    this._dataReadyIntervalId = undefined;
    this._dataReadyPercentage = MAX_PERCENTAGE;
  }

  private startIntervalForDataReady() {
    this._log('start interval for data ready..');


    this.runOneInterval();
    this._dataReadyIntervalId = setInterval(() => {
      this.runOneInterval();
    }, INTERVAL_MS);

    this._hasStartedWaitingForData = true;
  }

  private runOneInterval() {

    if (this._dataReadyPercentage >= MAX_PERCENTAGE) {
      this.clearIntervalIfRunning();
      return;
    }

    this._dataReadyPercentage += this._incrementPercentage;
  }

}

export const VOC_RESULT_STATUS = {
  PROCESSING: 'PROCESSING',
  READY: 'READY',
};

export interface VocResult {
  dataReadyPercentage: number;
  status: string; //VOC_RESULT_STATUS
  value?: number;
}
