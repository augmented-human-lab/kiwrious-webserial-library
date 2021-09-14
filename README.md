# kiwrious-webserial-library

## Install
`npm install kiwrious-webserial`

## Import
```typescript
import serialService from 'kiwrious-webserial/lib/service/SerialService';
import {SensorReadResult} from "kiwrious-webserial/lib/data/SensorReadResult";
import {SensorDecodedValue} from "kiwrious-webserial/lib/data/SensorDecodedValue";
```

## Use

connect
```typescript
// calling this method will invoke browser's usb serial connection prompt
// plugin your kiwirous sensor, select it press connect
await serialService.connectAndReadAsync();
```

subscribe
```typescript
serialService.onSerialData = (decodedData: SensorReadResult) => {
    const values = decodedData.decodedValues as SensorDecodedValue[];
    const no_of_observables = values.length;
    // Light - kiwrious uv sensor - 2 observables (uv, lux)
    // Climate - kiwrious humidity sensor - 2 observables (temperature, humidity)
    // EC - kiwrious conductivity sensor - 1 observable (conductivity)
    // Cardio - kiwrious heart rate sensor - 1 observable (pulse)
    // Thermal - kiwrious body temperature sensor - 2 observables (ambient temperature, infrared temperature)
    // Air - kiwrious voc sensor - 1 observable (voc)
    const label = values[0].label; // name of the first observable (ex. Temp for temperature)
    const value = values[0].value; // value of the first observable (ex. temperature value in celcius)
}
```

## kiwrious serial api
read sensor values
`onSerialData?: (data: SensorReadResult) => void;`
check connectivity
`onSerialConnection?: (connect: boolean) => void;`
connect and read
`connectAndReadAsync(): Promise<void>;`
disconnect sensor
`triggerStopReading(): void;`
