import { SerialDecoder } from "./SerialDecoder";
import { SensorReadResult } from "../data/SensorReadResult";
import { SerialReader } from "./SerialReader";
import { SerialDecoderFactory } from "./SerialDecoderFactory";

class SerialService {
    public onSerialData?: (data: SensorReadResult) => void;
    public onSerialConnection?: (connect: boolean) => void;

    private _isConnected: boolean = false;
    private _isReading: boolean = false;
    private _port: any;  //TODO: TYPE
    private _reader: any;

    private _log(...msg: any) {
        console.log('|SerialService|', ...msg);
    }
    private _err(...msg: any) {
        console.error("|SerialService|", ...msg);
    }
    private _warn(...msg: any) {
        console.warn("|SerialService|", ...msg);
    }

    public get isReading(): boolean {
        return this._isReading;
    }

    public get canResumeReading(): boolean {
        // if the port is not null then we probably can resume
        return !!this._port;
    }

    public triggerStopReading() {
        // This will cause to exit the reading loop gracefuly
        this._isReading = false;
    }

    private closeReader() {
        this._log('closing reader..');
        if (!this._reader) {
            this._log('no reader found. exiting..');
            return;
        }

        this.triggerStopReading();


        this._log('cancelling..');
        this._reader.cancel(); /* Todo: uncaught exception when the sensor is suddenly unplugged */

        this._log('releasing lock..');
        this._reader.releaseLock();

        this._reader = null;
        this._log('reader closed');


    }

    private async closePortAsync() {
        this._log('closing port..');
        if (!this._port) {
            this._log('no port found. exiting..');
            return;
        }

        this._isConnected = false;

        try {
            await this._port.close();
            this._log('port closed');
        }
        catch(e) {
            this._err('failed to close port', e);
        }
        // DO NOT UNCOMMECNT THE NEXT LINE. We keep a reference to the port so we can reuse it later
        // this.port = null;


        if (this.onSerialConnection) {
            this.onSerialConnection(this._isConnected);
        }
    }

    public async resumeReading() {
        this._log('resume reading..');

        if (!this._port) {
            this._log('port not found, restarting..');
            await this.connectAndReadAsync();

            return;
        }

        return await this.startStage2ConnectPortAsync(this._port);
    }

    public async disconnectAsync() {
        this._log('disconnecting..');

        this.triggerStopReading();

        setTimeout(async () => {
            await this.stopStage2ClosePortAsync();
        }, 0);
    }

    public async connectAndReadAsync() {
        this._log('connect and read..');
        const port = await this.startStage1RequestPortAsync();
        if (!port) {
            this._err('unable to request port');
            return;
        }

        return await this.startStage2ConnectPortAsync(port);
    }


    private async startStage1RequestPortAsync() {
        const { serial } = navigator as any;

        if (!serial) {
            alert("This feature only works on Chrome with 'Experimental Web Platform features' enabled");
            return null;
        }

        serial.onconnect = () => {
            this._log('serial connect');
        };
        serial.ondisconnect = async () => {
            this._log('serial disconnect');
            await this.disconnectAsync();

            this._port = null;
        };

        this._log('requesting port..');
        const port = await serial
            .requestPort({
                filters: [{ usbVendorId: 0x04d8, vendorId: 0x04d8 }, { usbVendorId: 0x0d28, usbProductId: 0x0204 }],
            })
            .catch((e: Error) => {
                this._err(`failed to serial.requestPort`, e);
            });

        if (!port) {
            this._err("unable to find port value");
            return null;
        }

        return port;
    }

    private async startStage2ConnectPortAsync(port: any) {
        this._log('startStage2ReadingAsync');

        const connection = await this.connectPortAsync(port);
        if (!connection) {
            this._err('failed to connect');
            return
        }

        this._isConnected = true;
        this._port = connection.port;
        this._reader = connection.reader;

        if (this.onSerialConnection) {
            this.onSerialConnection(this._isConnected);
        }

        this.startReading();
    }

    private async stopStage2ClosePortAsync() {
        this._log('stopStage2ClosePortAsync');
        this.closeReader();
        await this.closePortAsync();
    }

    //TODO: PORT ANY
    private async connectPortAsync(port: any) {
        const portInfo = port.getInfo();
        this._log('port info', portInfo);

        if (port.readable) {
            this._err("port is already readable");
            return null;
        }

        this._log('openning port..');
        await port
            .open({ baudrate: 115200, baudRate: 115200 })
            .catch((e: Error) => {
                this._err(`failed to port.open`, e);
            });

        if (!port.readable) {
            this._err(`port is not readable..`);
            return null;
        }

        const reader = port.readable.getReader();
        if (reader.locked) {
            this._err("reader is locked");
            return null;
        }


        return { port, reader };
    }

    private async startReading() {
        try {
            this._log('starting reader..');
            const serialReader = new SerialReader(this._reader);

            this._log('creating decoder..');
            const serialValueForDecoder = await serialReader.readOnce();
            const decoderSensorType = serialValueForDecoder.sensorType;

            const decoder = SerialDecoderFactory.createDecoder(decoderSensorType);

            this._log('starting loop..');
            this._isReading = true;

            while (this._isReading) {
              const serialValue = await serialReader.readOnce();
              const decodedValues = decoder.decode(serialValue);

              if (decodedValues) {
                if (decoderSensorType !== decodedValues.sensorType) {
                  this._err(`invalid sensor type. expecting ${decoderSensorType}, but got ${decodedValues.sensorType}. values: ${serialValue.rawValue}`);
                  continue;
                }

                if ( this.onSerialData) {
                  this.onSerialData(decodedValues);
                }
              }
            }

            this._log('loop complete..');
        }
        catch (e) {
            this._err('error reading loop startReading', e);
        }
        finally {
            this.stopStage2ClosePortAsync();
            this._log('startReading complete');
        }
    }

}

const singletonInstance = new SerialService();

export default singletonInstance;
