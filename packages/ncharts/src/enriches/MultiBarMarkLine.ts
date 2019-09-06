import {IEnrichSerie} from "./IEnrichSerie";
import {IEnrich, IMode, IOptions} from "../ICharts";
import ModeFactory from "../factories/mode/ModeFactory";
import Data from "../util/Data";
import Type from "../util/Type";
import {ENRICH_MULTILINE} from "./const";

export default class MultiBarMarkLine implements IEnrichSerie {

    handleEnrich(enrich: IEnrich, series, options: IOptions) {
        const mode: IMode = ModeFactory.getInstance().getMode(options);

        const levelValues: any[] = [];

        (series || []).forEach((serie, levelIdx) => {
            const values = Data.getInstance().get("data", serie) || [];

            levelValues[levelIdx] = values;

        });

        const top = enrich.top;

        (levelValues).forEach((values, levelIdx) => {

            if (top === false && levelIdx === (levelValues.length - 1)) {
                return;
            }
            if (values.length && values.length > 1) {

                var groups = [];

                values.forEach((value, _) => {
                    if (_ < (values.length - 1)) {
                        groups.push(this.getGroupValues(values, levelValues, levelIdx, _, mode))
                    }
                });

                Data.getInstance().set("markLine.data", groups, series[levelIdx]);
            }
        })

        return null;
    }

    // 生成一段 markline 的数据组；
    getGroupValues(values, levelValues, levelIdx, idx, mode: IMode) {
        const len = 2;
        const groups = [];

        for (let i = 0; i < len; i++) {

            groups.push({
                [mode.x]: idx,
                [mode.y]: this.getValue(levelValues, values, levelIdx, idx),
            });

            idx++;
        }

        return groups;
    }

    getValue(levelValues, values, levelIdx, idx) {
        let value;
        let sum = 0;

        for (let i = 0; i <= levelIdx; i++) {
            value = Type.getInstance().isObject(levelValues[i][idx]) ? levelValues[i][idx].value : levelValues[i][idx];
            sum += Number(value);
        }

        return sum;
    }

    getEnrichSymbol(): string {
        return ENRICH_MULTILINE;
    }

}
