import { SerialRawValue } from "./SerialRawValue";
import { SerialReader } from "./SerialReader";


export abstract class ValueReader {
    abstract readValue(serialReader: SerialReader): Promise<SerialRawValue[]>;
}

export class SingleValueReader {
    async readValue(serialReader: SerialReader): Promise<SerialRawValue[]> {
        const value = await serialReader.readOnce();
        return [value];
    }
}

export class TenValuesReader {
    async readValue(serialReader: SerialReader): Promise<SerialRawValue[]> {
        const values = await serialReader.readMultiple(10);
        return values;
    }
}