import { SensorReadResult } from "../data/SensorReadResult";
import { SerialRawValue } from "./SerialRawValue";


export abstract class SerialDecoder {

    protected _log(...msg: any) {
        console.log('|SerialDecoder|', ...msg);
    }

    protected _err(...msg: any) {
        console.error("|SerialDecoder|", ...msg);
    }

    abstract decode(rawValue: SerialRawValue): SensorReadResult|null;
}

