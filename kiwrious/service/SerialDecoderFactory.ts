import { SENSOR_TYPE } from "./SerialRawValue";

import { SerialDecoder } from "./SerialDecoder";

import { HumiditySerialDecoder } from "./SerialHumidityDecoder";
import { UVSerialDecoder } from "./SerialUVDecoder";
import { VOCSerialDecoder } from "./SerialVOCDecoder";
import { ConductivitySerialDecoder } from './SerialConductivityDecoder';
import { SerialHeartRateDecoder } from "./SerialHeartRateDecoder";
import { SerialHeartRate2Decoder } from "./SerialHeartRate2Decoder";
import { TemperatureSerialDecoder } from "./SerialTemperatureDecoder";
import { Temperature2SerialDecoder } from "./SerialTemperature2Decoder";
import { SingleValueReader, TenValuesReader, ValueReader } from "./ValueReader";

export class SerialDecoderFactory {

    static _log(...msg: any) {
        console.log('|SerialDecoderFactory|', ...msg);
    }
    static _err(...msg: any) {
        console.error("|SerialDecoderFactory|", ...msg);
    }

    static createDecoder(type: string): SerialDecoder {
        SerialDecoderFactory._log('createDecoder');
        SerialDecoderFactory._log('type = ' + type);
        switch (type) {
            case SENSOR_TYPE.UV:
            case SENSOR_TYPE.UV2:
                return new UVSerialDecoder();
            case SENSOR_TYPE.HUMIDITY: return new HumiditySerialDecoder();
            case SENSOR_TYPE.HEART_RATE: return new SerialHeartRateDecoder();
            case SENSOR_TYPE.HEART_RATE2: return new SerialHeartRate2Decoder();
            case SENSOR_TYPE.VOC: return new VOCSerialDecoder();
            case SENSOR_TYPE.CONDUCTIVITY: return new ConductivitySerialDecoder();
            case SENSOR_TYPE.TEMPERATURE: return new TemperatureSerialDecoder();
            case SENSOR_TYPE.TEMPERATURE2: return new Temperature2SerialDecoder();

            case SENSOR_TYPE.HEART_RATE2: return new SerialHeartRate2Decoder();

            default:
                throw new Error(`invalid type ${type}`);
        }
    }

    static createReader(type: string): ValueReader {
        SerialDecoderFactory._log('createReader');

        switch (type) {
            case SENSOR_TYPE.UV:
            case SENSOR_TYPE.UV2:
            case SENSOR_TYPE.HUMIDITY:
            case SENSOR_TYPE.HEART_RATE:
            case SENSOR_TYPE.VOC:
            case SENSOR_TYPE.CONDUCTIVITY:
            case SENSOR_TYPE.TEMPERATURE:
            case SENSOR_TYPE.TEMPERATURE2:
                return new SingleValueReader();

            case SENSOR_TYPE.HEART_RATE2:
                return new TenValuesReader();

            default:
                throw new Error(`invalid type ${type}`);
        }
    }
}

