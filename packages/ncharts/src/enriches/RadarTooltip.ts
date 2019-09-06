import {IEnrichSerie, ITooltip} from "./IEnrichSerie";
import {ENRICH_NORMAL_RADAR_TOOLTIP} from "./const";
import {IEnrich, IOptions} from "../ICharts";
import {IIndicator} from "../factories/input/radar/IDataFactory";
import Data from "../util/Data";
import {FORMATTER, GLOBAL, INDICATOR, OPTION, RADAR, SOURCES, TOOLTIP} from "../const";

export default class RadarTooltip implements IEnrichSerie {
    getEnrichSymbol(): string {
        return ENRICH_NORMAL_RADAR_TOOLTIP;
    }

    // 获取指标；
    handleEnrich(enrich: IEnrich, series, options: IOptions) {
        const indicators: IIndicator[] = Data.getInstance().get([OPTION, RADAR, INDICATOR], options);
        const {map} = enrich;
        const sources = Data.getInstance().get([GLOBAL, SOURCES], options);

        const formatter = params => {
            const values = params.value;
            const {name, dataIndex} = params;
            const tooltip = map[name];
            const list = sources[dataIndex];
            const len = list && list.length || 0;
            const tips = [];

            if (tooltip) {
                const {before, after} = tooltip;

                before && before.map(t => {
                    tips.push(this.handleTooltip(t, len == 1 ? list[0] : null));
                });

                indicators.map((item, idx) => {
                    tips.push(`${params.marker}${item.name}：${values[idx]}`)
                });

                after && after.map(t => {
                    tips.push(this.handleTooltip(t, len == 1 ? list[0] : null));
                });
            }

            return tips.join("<br/>");
        }

        Data.getInstance().set([OPTION, TOOLTIP, FORMATTER], formatter, options);
    }

    private handleTooltip(t: ITooltip, v) {
        if (v) {
            const {name, mark, value} = t;
            const val = v[value];
            return `${mark}${name}：${ val || "--"}`;
        } else {
            return t.name;
        }
    }
}