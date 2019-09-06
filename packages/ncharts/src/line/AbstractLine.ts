import {utils} from "hqjlcommon";
import IFactory from "../IFactory";
import {IOptions} from "../ICharts";

export default abstract class AbstractLine implements IFactory {

    options;

    initialize(options: IOptions) {
        this.options = options;
        const option = utils.nzyextend(true, this.getOption(), this.handleOption(options));

        return option;
    }

    abstract handleOption(options: IOptions): any;

    getOption() {
        return {}
    }
}
