import {IEnrichSerie} from "./IEnrichSerie";
import {IEnrich, IOptions} from "../ICharts";
import Data from "../util/Data";

export default class RevertSeries implements IEnrichSerie {
    getEnrichSymbol(): string {
        return "revert_series";
    }

    // 将梯队的值进行反转；
    handleEnrich(enrich: IEnrich, series: any[], options: IOptions) {
        const legends: any[] = Data.getInstance().get("option.legend.data", options);
        legends.reverse();
        Data.getInstance().set("option.legend.data", legends, options);

        //
        Data.getInstance().set("option.tooltip.formatter", params => {
            const arr: any[] = [];
            for (let i = 0; i < params.length; i++) {
                const { name, seriesName, value, marker } = params[i];
                if (i === 0) {
                    arr.push(`${name}`);
                }
                arr.splice(1, 0, `${marker}${seriesName}：${value}`);
            }

            return arr.join("<br/>");
        }, options);
    }
}
