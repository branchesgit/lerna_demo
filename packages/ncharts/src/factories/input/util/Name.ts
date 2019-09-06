// import Ary from "@/util/Ary";
// import {DATA, GLOBAL, KEY, LEGEND, OPTION, SERIES} from "@/const";
// import Data from "@/util/Data";
// import Type from "@/util/Type";
// import {IOptions} from "@/ICharts";
// import {IExtra} from "@/ICharts";

import Data from "../../../util/Data";
import {DATA, GLOBAL, KEY, LEGEND, OPTION, SERIES} from "../../../const";
import Type from "../../../util/Type";
import Ary from "../../../util/Ary";
import {IExtra, IOptions} from "../../../ICharts";

/**
 *  处理label数据工具类， 鉴于有通用性，以及
 */
export default class Name {
    private constructor() {
    }

    private static instance: Name;

    static getInstance(): Name {
        if (!Name.instance) {
            Name.instance = new Name();
        }

        return Name.instance;
    }

    handleLabelInfo(axis, extra, sourceInfo) {
        const {sources} = extra;
        const labelInfo = Data.getInstance().get(DATA, axis);
        let labels = [];

        if (labelInfo) {
            const tins = Type.getInstance();

            if (tins.isArray(labelInfo)) {
                labels = labelInfo;

            } else if (tins.isFunction(labelInfo)) {
                labels = labelInfo(sources);

            } else if (tins.isObject(labelInfo)) {
                const key = Data.getInstance().get(KEY, labelInfo);
                let len = sources && sources.length || 0;
                const {merge, split} = sourceInfo;

                // 如果单一完整的数据长度超过了1， 那么就说明是多维度的；
                if (len > 1 && merge) {
                    const values = []

                    for (let i = 0; i < len; i++) {
                        values.push(Ary.getInstance().getLastList(key, [sources[i]]));
                    }

                    let llen = len;

                    if (split) {
                        llen++;
                    }

                    for (let j = 0; j < values[0].length; j++) {

                        for (let i = 0; i < llen; i++) {

                            if (i < len) {
                                labels.push(values[i][j]);
                            } else if (j < (values[0].length - 1)) {
                                labels.push("");
                            }
                        }
                    }

                } else {
                    labels = Ary.getInstance().getLastList(key, sources);
                }

            }
        }

        Data.getInstance().set(DATA, labels, axis);

        return labels;
    }

    getSeriesNames(extra: IExtra, options: IOptions, callback) {
        const ins: Data = Data.getInstance();
        let conf = ins.get([GLOBAL, SERIES], options);
        let names;
        const tins: Type = Type.getInstance();

        if (conf) {
            names = tins.isFunction(conf) ? conf(extra.sources) :
                tins.isArray(conf) ? conf : callback(conf, extra);
        } else {
            names = Data.getInstance().get([OPTION, LEGEND, DATA], options);
        }

        return names;
    }
}
