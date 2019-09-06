/**
 *  通过serie.origdata 来获取对应的数据源；
 */
import {IEnrichSerie} from "./IEnrichSerie";
import {IEnrich, IOptions} from "../ICharts";
import {ENRICH_TOP_LABEL} from "./const";
import Data from "../util/Data";
import {FORMATTER, LABEL, NORMAL, OPTION, ORIGDATA, POINT, SERIES} from "../const";

export default class TopLabel implements IEnrichSerie {

    getEnrichSymbol(): string {
        return ENRICH_TOP_LABEL;
    }

    handleEnrich(enrich: IEnrich, series, options: IOptions) {
        const len = series && series.length || 0;

        if (len) {
            const list = Data.getInstance().get([OPTION, SERIES].join(POINT), options);
            const serie = list[len - 1];
            let dataInfo = Data.getInstance().get([LABEL, NORMAL, FORMATTER].join(POINT), serie) || {separator: "/"}
            const origs = serie[ORIGDATA].reverse();

            const formatter = params => {
                const {dataIndex} = params;
                const vs = [];

                for (let i = 0; i < len; i++) {
                    vs.push(origs[i][dataIndex]);
                }

                return vs.join(dataInfo.separator);
            }

            Data.getInstance().set([LABEL, NORMAL, FORMATTER].join(POINT), formatter, series[len - 1]);
        }
    }
}