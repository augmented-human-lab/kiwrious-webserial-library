import { SerialRawValue } from "./SerialRawValue";

const EXPECTED_PACKET_SIZE = 26;
const PACKET_HEADER_BYTE = 0x0a;
const PACKET_FOOTER_BYTE = 0x0b;
const MAX_RETRY_TIME = 4096;

export class SerialReader {
  private _buffer: Uint8Array;
  private readonly _reader: ReadableStreamDefaultReader;

  constructor(reader: ReadableStreamDefaultReader) {
    this._reader = reader;
    this._buffer = new Uint8Array();
  }

  _log(...msg: any) {
    console.log('|SerialReader|', ...msg);
  }

  _err(...msg: any) {
    console.error('|SerialReader|', ...msg);
  }

  private async _readDataToBuffer() {

    //read data from reader
    const readInstance = await this._reader.read();
    const { value, done } = readInstance;

    if (done) {
      this._log("[_readDataToBuffer] DONE", done);
      throw new RangeError('reader disconnected.');
    }
    this._buffer = SerialReader.concatArray(this._buffer, value);
    this._log('added to array. length:', value.length, this._buffer.length);
  }

  private async _locateHeader() {
    let retryTime = 0;
    /* Try to locate header bytes using loop */

    while (retryTime < MAX_RETRY_TIME) {
      /* We need at least two bytes to locate the header */
      if (this._buffer.length >= 2) {
        for (let i = 0; i < this._buffer.length - 1; i++) {
          if (this._buffer[i] == PACKET_HEADER_BYTE && this._buffer[i + 1] == PACKET_HEADER_BYTE) {
            /* Found the header, dump the bytes before header */
            this._buffer = this._buffer.subarray(i);
            return
          }
        }
      }
      /* Header not found yet */
      retryTime++;
      await this._readDataToBuffer();
    }
    throw new Error('Unable to locate packet header');
  }

  async readOnce(): Promise<SerialRawValue> {
    let retryTime = 0;
    while (retryTime < MAX_RETRY_TIME) {
      await this._locateHeader();

      /* Read a complete packet */
      while (this._buffer.length < EXPECTED_PACKET_SIZE) {
        await this._readDataToBuffer();
      }

      /* Validate Footer */
      if (this._buffer[EXPECTED_PACKET_SIZE - 2] == PACKET_FOOTER_BYTE && this._buffer[EXPECTED_PACKET_SIZE - 1] == PACKET_FOOTER_BYTE) {
        /* Extract the packet from buffer */
        const value = new SerialRawValue(this._buffer.subarray(0, EXPECTED_PACKET_SIZE));
        this._buffer = this._buffer.subarray(EXPECTED_PACKET_SIZE);
        this._log('reading meta', value.header2Bytes, value.footer2Bytes, value.rawValue.length, value.sensorTypeRaw);
        return value;
      }

      /* footer validation failed, we dump the header we found and restart the loop */
      this._buffer = this._buffer.subarray(2);
      retryTime++;
    }

    throw new Error('Failed to extract a packet due to protocol error');
  }

  static concatArray(a: Uint8Array, b: Uint8Array): Uint8Array {
    const c = new Uint8Array(a.length + b.length);
    c.set(a, 0);
    c.set(b, a.length);

    return c;
  }
}