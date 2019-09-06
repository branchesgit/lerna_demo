import {IEnrichSerie} from "./IEnrichSerie";
import {IEnrich, IOptions} from "../ICharts";
import Data from "../util/Data";
import {ENRICH_REVERSE_SERIES} from "./const";
import FakeSerieData from "./FakeSerieData";

export default class ReverseSeries implements IEnrichSerie {
    getEnrichSymbol(): string {
        return ENRICH_REVERSE_SERIES;
    }

    // 将梯队的值进行反转；
    handleEnrich(enrich: IEnrich, series: any[], options: IOptions) {
        series.reverse();
        const fake: FakeSerieData = new FakeSerieData();

        Data.getInstance().set("option.tooltip.formatter", params => {
            const arr: any[] = [];

            for (let i = 0; i < params.length; i++) {
                const {name, seriesName, value, marker} = params[i];

                if (i === 0) {
                    arr.push(`${name}`);
                }

                let val = fake.hasFakeEnrich(options) ? fake.getOriValue(series, params[i]) : value;
                if (enrich.enrich) {
                    val = enrich.enrich(val);
                }

                arr.splice(1, 0, `${marker}${seriesName}: ${val}`);
            }

            return arr.join("<br/>");
        }, options);
    }
}
