import { SensorDecodedValue } from "../data/SensorDecodedValue";
import { SensorReadResult } from "../data/SensorReadResult";
import { SerialDecoder } from "./SerialDecoder";
import { SENSOR_VALUE, SerialRawValue } from "./SerialRawValue";

export class UVSerialDecoder extends SerialDecoder {

    constructor() {
        super();
    }

    _log(...msg: any) {
        console.log('|UVSerialDecoder|', ...msg);
    }

    async decode(rawValues: SerialRawValue[]): Promise<SensorReadResult | null> {
        if (!rawValues.length) {
            throw new Error('invlalid input. expected 1 value at least')
        }

        const rawValue = rawValues[0];

        const data0f = rawValue.getFourBytesFloatByIndex(6).toFixed(0);
        const data1f = rawValue.getFourBytesFloatByIndex(10).toFixed(1);


        const value0: SensorDecodedValue = { label: SENSOR_VALUE.LUX, value: data0f, type: "number" };
        const value1: SensorDecodedValue = { label: SENSOR_VALUE.UV_INDEX, value: data1f, type: "number" };

        const result: SensorReadResult = {
            sensorType: rawValue.sensorType,
            decodedValues: [value0, value1]
        };

        return result;
    }
}
