import { SerialDecoder } from "./SerialDecoder";
import { HumiditySerialDecoder } from "./SerialHumidityDecoder";
import { SENSOR_TYPE } from "./SerialRawValue";
import { UVSerialDecoder } from "./SerialUVDecoder";
import { VOCSerialDecoder } from "./SerialVOCDecoder";
import { ConductivitySerialDecoder } from './SerialConductivityDecoder';
import { SerialHeartRateDecoder } from "./SerialHeartRateDecoder";
import { TemperatureSerialDecoder } from "./SerialTemperatureDecoder";
import {Temperature2SerialDecoder} from "./SerialTemperature2Decoder";

export class SerialDecoderFactory {

    static _log(...msg: any) {
        console.log('|SerialDecoderFactory|', ...msg);
    }
    static _err(...msg: any) {
        console.error("|SerialDecoderFactory|", ...msg);
    }

    static createDecoder(type: string): SerialDecoder {
        SerialDecoderFactory._log('createDecoder');

        switch (type) {
            case SENSOR_TYPE.UV: return new UVSerialDecoder();
            case SENSOR_TYPE.HUMIDITY: return new HumiditySerialDecoder();
            case SENSOR_TYPE.HEART_RATE: return new SerialHeartRateDecoder();
            case SENSOR_TYPE.VOC: return new VOCSerialDecoder();
            case SENSOR_TYPE.CONDUCTIVITY: return new ConductivitySerialDecoder();
            case SENSOR_TYPE.TEMPERATURE: return new TemperatureSerialDecoder();
            case SENSOR_TYPE.TEMPERATURE2: return new Temperature2SerialDecoder();
            default:
                throw new Error(`invalid type ${type}`);
        }
    }
}
