import {utils} from "hqjlcommon";
import IFactory from "../IFactory";
import {IOptions} from "../ICharts";
import {RADAR} from "../const";

export default abstract class AbstractRadar implements IFactory {

    options;

    initialize(options: IOptions) {
        this.options = options;
        const option = utils.nzyextend(true, this.getOption(), this.handleOption(options));

        return option;
    }

    abstract handleOption(options);

    private getOption() {
        return {
            series: [{type: RADAR}],
            grid: {
                containLabel: true
            }
        }
    }

}