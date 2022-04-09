import { SensorDecodedValue } from "../data/SensorDecodedValue";
import { SensorReadResult } from "../data/SensorReadResult";
import { HeartRateProcessor, HEART_RATE_RESULT_STATUS } from "./HeartRateProcessor";
import { MinValueThreshold } from "./MinValueThreshold";
import { SerialDecoder } from "./SerialDecoder";
import { SENSOR_VALUE, SerialRawValue } from "./SerialRawValue";
import { SerialUtil } from "./SerialUtil";

declare const HeartRateDetector: any;

export class SerialHeartRate2Decoder extends SerialDecoder {
    _processor: HeartRateProcessor;

    _detector: any;

    _thresholdChecker: MinValueThreshold = new MinValueThreshold();

    constructor() {
        super();

        this._processor = new HeartRateProcessor();

        // Detector 
        this._detector = new HeartRateDetector();
    }

    _log(...msg: any) {
        console.log('|SerialHeartRateDecoder|', ...msg);
    }

    async decode(array: SerialRawValue[]): Promise<SensorReadResult | null> {
        // this._log('array', array);
        // this._log('headers-footers', rawValue.header2Bytes, rawValue.footer2Bytes);

        // check the first rawvalue if the sensor is being touched
        const sliced = array[0].rawValue.slice(0, 26);
        const rawValue = new SerialRawValue(sliced);
        const data0 = rawValue.getFourBytesByIndex(6);
        const isValid = this._thresholdChecker.check(data0);
        this._log('rawValue', data0, isValid);

        const value0: SensorDecodedValue = {
            label: SENSOR_VALUE.HEART_RATE,
            value: {
                status: HEART_RATE_RESULT_STATUS.TOO_LOW,
                value: 0
            },
            type: "object"
        };
        const result: SensorReadResult = {
            sensorType: array[0].sensorType,
            decodedValues: [value0]
        };

        const subArrays = array.map(i => i.rawValue.subarray(6, 22));
        // this._log('subArrays', subArrays);

        const rawData = SerialUtil.concatMultiArrays(subArrays);
        // this._log('rawData', rawData);



        if (isValid) {
            const heartRateResult = await this._detector.detectHeartRate(rawData);
            this._log('heartrate-result', heartRateResult);

            value0.value = heartRateResult;
        }


        return result;
    }
}
