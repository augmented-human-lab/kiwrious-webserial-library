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
```typescript
await serialService.connectAndReadAsync();
```
