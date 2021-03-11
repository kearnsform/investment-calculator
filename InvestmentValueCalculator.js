// math reference
// https://keisan.casio.com/exec/system/1234231998

class InvestmentValueCalculator {
    constructor(pv, r, n, pmt, fv, k, isBeginning) {
        this.pv = pv;
        this.r = r;
        this.n = n;
        this.pmt = pmt;
        this.fv = fv;
        this.k = k;
        this.isBeginning = isBeginning;
    }

    #calcFactors() {
        let rate_decimal = this.r / 100;
        let growthFactor = (1 + rate_decimal / this.k) ** (this.n * this.k);
        let contributionGrowthFactor = this.n * this.k;
        if (this.r !== 0) {
            contributionGrowthFactor = (growthFactor - 1) / (rate_decimal / this.k);
            if (this.isBeginning) {
                contributionGrowthFactor = contributionGrowthFactor * (1 + rate_decimal / this.k);
            }
        }
        return { growthFactor, contributionGrowthFactor };
    }

    #calcFV() {
        const { growthFactor, contributionGrowthFactor } = this.#calcFactors();
        return this.pv * growthFactor + this.pmt * contributionGrowthFactor;
    }

    #calcPV() {
        const { growthFactor, contributionGrowthFactor } = this.#calcFactors();
        return (this.fv - this.pmt * contributionGrowthFactor) / growthFactor;
    }

    #calcPMT() {
        const { growthFactor, contributionGrowthFactor } = this.#calcFactors();
        return (this.fv - this.pv * growthFactor) / contributionGrowthFactor;
    }

    compute(outputid) {
        switch (outputid) {
            case 'fv':
                return this.#calcFV();
            case 'pmt':
                return this.#calcPMT();
            case 'pv':
                return this.#calcPV();
            case 'n':
            case 'r':
                return bijection_solve(this.trial_function(outputid), -100, 100);
            default:
                throw `Could not find a calculator for ${outputid}.`;
        }
    }

    trial_function(outputid) {
        return (x) => {
            this[outputid] = x;
            return this.#calcFV() - this.fv;
        }
    }

}

function bijection_solve(f, arg_min, arg_max, tolerance = 0.01) {
    let [arg_min_output, arg_max_output] = (f(arg_min) < f(arg_max)) ? [arg_min, arg_max] : [arg_max, arg_min];
    let trialNumber = 1;
    while (trialNumber <= 100) {
        let arg_midpoint = (arg_min_output + arg_max_output) / 2
        let trial_output = f(arg_midpoint)
        if (Math.abs(trial_output) < tolerance) {
            return arg_midpoint
        } else {
            if (trial_output < 0) {
                arg_min_output = arg_midpoint
            } else if (0 < trial_output) {
                arg_max_output = arg_midpoint
            }
        }
        trialNumber++;
    }
    throw `Unable to find a solution. The search range is limited to values between ${arg_min} and ${arg_max}.`;
}