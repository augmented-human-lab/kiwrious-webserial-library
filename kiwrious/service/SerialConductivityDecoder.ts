import {SensorDecodedValue} from "../data/SensorDecodedValue";
import {SensorReadResult} from "../data/SensorReadResult";
import {SerialDecoder} from "./SerialDecoder";
import {SENSOR_VALUE, SerialRawValue} from "./SerialRawValue";

export const CONDUCTIVITY_RESULT_STATUS = {
  MAX: 'MAX',
  MIN: 'MIN',
  READY: 'READY',
};

export interface ConductivityResult {
  status: string;
  value: number | string;
}

const MAX_CONDUCTANCE_VALUE = 200000;
const MIN_CONDUCTANCE_VALUE = 65535;

export class ConductivitySerialDecoder extends SerialDecoder {

  constructor() {
    super();
  }

  _log(...msg: any) {
    console.log('|ConductivitySerialDecoder|', ...msg);
  }

  decode(rawValue: SerialRawValue): SensorReadResult | null {

    if (!rawValue.isValidLength) {
      this._log(`invalid length ${rawValue.rawValue.length}. skipping..`);
      return null;
    }

    const data0f = rawValue.getTwoBytesByIndex(6);
    const data1f = rawValue.getTwoBytesByIndex(8);

    const conductivity = ConductivitySerialDecoder.calculateConductivity(data0f, data1f);



    const value0: SensorDecodedValue = {label: SENSOR_VALUE.CONDUCTIVITY, value: conductivity, type: "object"};

    const result: SensorReadResult = {
      sensorType: rawValue.sensorType,
      decodedValues: [value0]
    };

    return result;
  }

  private static calculateConductivity(data0: number, data1: number): ConductivityResult {
    //Conductivity sensor returns -1 to indicate near-infinity (When nothing is connected)
    if (data0 >= MIN_CONDUCTANCE_VALUE) {
      const result: ConductivityResult = {
        value: 0,
        status: CONDUCTIVITY_RESULT_STATUS.MIN
      };

      return result;
    }

    const conductivity = Number(((1 / (data0 * data1)) * Math.pow(10, 6)).toFixed(1));

    if (conductivity > MAX_CONDUCTANCE_VALUE) {
      const result: ConductivityResult = {
        value: 'MAX',
        status: CONDUCTIVITY_RESULT_STATUS.MAX
      };
      return result;
    }

    const result: ConductivityResult = {
      value: conductivity,
      status: CONDUCTIVITY_RESULT_STATUS.READY
    };
    return result;
  }
}
