export class MinValueThreshold {
    LOW_THRESHOLD: number = 1e5;
    HIGH_THRESHOLD: number = 2e6;

    _isAboveHigh: boolean = false;


    check(value: number): boolean {

        if (value > this.HIGH_THRESHOLD) {
            this._isAboveHigh = true;

            return true;
        }

        if (this._isAboveHigh) {
            if (value > this.LOW_THRESHOLD) {
                // still above low
                return true;
            }
            else {
                this._isAboveHigh = false;

                return false;
            }
        }

        // not reached high yet
        return false;
    }
}