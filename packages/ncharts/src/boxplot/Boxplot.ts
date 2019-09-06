import AbstractBoxplot from "./AbstractBoxplot";
import {IMode, IOptions} from "../ICharts";
import ModeFactory from "../factories/mode/ModeFactory";
import Data from "../util/Data";
import Type from "../util/Type";

export default class Boxplot extends AbstractBoxplot {

    static BOX_DATA_KEY_LEN = 4;

    handleOption(options: IOptions): any {
        const result = this.handleBoxplotData(options);
        const mode: IMode = ModeFactory.getInstance().getMode(options);

        Data.getInstance().set(`option.${mode.x}.data`, result.axisData || [], options);
        Data.getInstance().set(`option.series.0.data`, result.boxData || [], options);
        Data.getInstance().set(`option.series.1.data`, result.outliers || [], options);

        const option = options.option;
        return option;
    }

    private handleSource(options: IOptions) {
        let source = Data.getInstance().get("global.source", options);
        const tins = Type.getInstance();
        source = tins.isFunction(source) ? source() :
            tins.isArray(source) ? source : source.data;
        return tins.isArray(source) ? source : [source];
    }

    private handleBoxplotData(options: IOptions) {
        let result: any = {};
        const tins = Type.getInstance();
        const source = Data.getInstance().get(`global.source`, options);

        if (tins.isObject(source)) {
            const sources = this.handleSource(options);

            result = {
                axisData: this.handleLabels(sources, options),
                boxData: this.handleBoxData(sources, options),
                outliers: this.handleOutliers(sources, options)
            }

        } else if (tins.isFunction(source)) {
            result = source();
        }

        return result;
    }

    private handleLabels(sources, options: IOptions) {
        const mode: IMode = ModeFactory.getInstance().getMode(options);
        const labelInfo = Data.getInstance().get(["option", mode.x, "data"].join("."), options);
        const tins = Type.getInstance();
        let values = [];

        if (tins.isObject(labelInfo)) {
            (sources || []).map((item, _) => {
                values[_] = item[labelInfo.key];
            })

        } else if (tins.isFunction(labelInfo)) {
            values = labelInfo(sources);
        }

        return values;
    }

    private handleBoxData(sources, options: IOptions) {
        const source = Data.getInstance().get(`global.source`, options);
        const tins = Type.getInstance();
        let values = [];

        if (tins.isObject(source)) {
            let keys = source.key || [];

            sources.map((item, _) => {
                const vals = [];

                keys.map((key, idx) => {
                    if (idx <= Boxplot.BOX_DATA_KEY_LEN) {
                        vals[idx] = item[key];
                    }
                });

                values[_] = vals;
            });

        } else if (tins.isFunction(source)) {
            values = source(sources).boxData;
        }

        return values;
    }

    private handleOutliers(sources, options: IOptions) {
        const source = Data.getInstance().get(`global.source`, options);
        const tins = Type.getInstance();
        let values = [];

        if (tins.isObject(source)) {
            const {key} = source;
            const exception = key[key.length - 1];

            sources.map((item, _) => {
                const vals = tins.isArray(item[exception]) ? item[exception] : [item[exception]];

                vals.map(val => {
                    values.push([_, val]);
                });
            });

        } else if (tins.isFunction(source)) {
            values = source(sources).boxData;
        }

        return values;
    }

}
