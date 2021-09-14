import {SensorDecodedValue} from "../data/SensorDecodedValue";
import {SensorReadResult} from "../data/SensorReadResult";
import {SerialDecoder} from "./SerialDecoder";
import {SENSOR_VALUE, SerialRawValue} from "./SerialRawValue";
import {SerialNumberValue} from "./SerialHexValue";

export class Temperature2SerialDecoder extends SerialDecoder {

  constructor() {
    super();
  }

  _log(...msg: any) {
    console.log('|Temperature2SerialDecoder|', ...msg);
  }

  decode(rawValue: SerialRawValue): SensorReadResult | null {
    if (!rawValue.isValidLength) {
      this._log(`invalid length ${rawValue.rawValue.length}. skipping..`);
      return null;
    }

    const data0f = new SerialNumberValue(rawValue.getTwoBytesSignedByIndex(6)).divideByHundred();

    const X = new SerialNumberValue(rawValue.getTwoBytesUnsignedByIndex(8)).value;
    const a = new SerialNumberValue(rawValue.getFourBytesFloatByIndex(10)).value;
    const b = new SerialNumberValue(rawValue.getFourBytesFloatByIndex(14)).value;
    const c = new SerialNumberValue(rawValue.getFourBytesFloatByIndex(18)).value;

    const infrared_temp = ((a * Math.pow(X, 2))/Math.pow(10, 5) + b * X + c).toFixed(0);


    const value0: SensorDecodedValue = {label: SENSOR_VALUE.AMBIENT_TEMPERATURE, value: data0f, type: "number"};
    const value1: SensorDecodedValue = {label: SENSOR_VALUE.INFRARED_TEMPERATURE, value: infrared_temp, type: "number"};

    const result: SensorReadResult = {
      sensorType: rawValue.sensorType,
      decodedValues: [value0, value1]
    };

    return result;
  }
}
