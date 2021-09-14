import {SensorDecodedValue} from "../data/SensorDecodedValue";
import {SensorReadResult} from "../data/SensorReadResult";
import {SerialDecoder} from "./SerialDecoder";
import {SENSOR_VALUE, SerialRawValue} from "./SerialRawValue";
import {SerialNumberValue} from "./SerialHexValue";

export class HumiditySerialDecoder extends SerialDecoder {

  constructor() {
    super();
  }

  _log(...msg: any) {
    console.log('|HumiditySerialDecoder|', ...msg);
  }

  decode(rawValue: SerialRawValue): SensorReadResult | null {
    if (!rawValue.isValidLength) {
      this._log(`invalid length ${rawValue.rawValue.length}. skipping..`);
      return null;
    }

    const data0f = new SerialNumberValue(rawValue.getTwoBytesSignedByIndex(6)).divideByHundred();
    const data1f = new SerialNumberValue(rawValue.getTwoBytesSignedByIndex(8)).divideByHundred();


    const value0: SensorDecodedValue = {label: SENSOR_VALUE.TEMPERATURE, value: data0f, type: "number"};
    const value1: SensorDecodedValue = {label: SENSOR_VALUE.HUMIDITY, value: data1f, type: "number"};

    const result: SensorReadResult = {
      sensorType: rawValue.sensorType,
      decodedValues: [value0, value1]
    };

    return result;
  }
}
