import {IEnrichSerie, ITooltip} from "./IEnrichSerie";
import {ENRICH_NORMAL_MUTIL_TOOLTIP} from "./const";
import {IEnrich, IOptions} from "../ICharts";
import Data from "../util/Data";
import {FORMATTER, GLOBAL, OPTION, PLUS, POINT, SOURCES, SUBTRACT, TOOLTIP} from "../const";
import Type from "../util/Type";
import Ary from "../util/Ary";

/**
 *  针对的 GroupInBean的输入数据，
 *
 */
export default class NormalMultiTooltip implements IEnrichSerie {
    getEnrichSymbol(): string {
        return ENRICH_NORMAL_MUTIL_TOOLTIP;
    }

    handleEnrich(enrich: IEnrich, series, options: IOptions) {
        const {tooltips} = enrich;
        const {before, after} = tooltips;
        const tooltipInfo = Data.getInstance().get([OPTION, TOOLTIP].join(POINT), options) || {};

        tooltipInfo[FORMATTER] = params => {
            const ret = this.getRet(enrich, params, options);

            if (ret) {
                const tips = [];

                if (before) {
                    before.map((t: ITooltip) => {
                        tips.push(this.handleTooltip(t, ret));
                    });
                }

                params.map(param => {
                    tips.push(`${param.marker}${param.seriesName}：${param.value || '-'}`)
                });

                if (after) {
                    after.map((t: ITooltip) => {
                        tips.push(this.handleTooltip(t, ret));
                    });
                }

                return tips.join('<br/>');
            }
        }

        Data.getInstance().set([OPTION, TOOLTIP].join(POINT), tooltipInfo, options);
    }

    private getDataIndex(params) {
        const dataIndex = Type.getInstance().isArray(params) ? params[0].dataIndex : params.dataIndex;
        return dataIndex;
    }

    private getRet(enrich: IEnrich, params, options: IOptions) {
        const sources = Data.getInstance().get([GLOBAL, SOURCES].join(POINT), options);
        const dataIndex = this.getDataIndex(params);
        const ret = Data.getInstance().get([0, enrich.source, dataIndex].join(POINT), sources);
        return ret;
    }

    private handleTooltip(t: ITooltip, ret) {
        const {mark, name, value, opv, operation} = t;
        const v = ret[value];
        let val = v;

        // 有逻辑运算的：
        if (operation) {
            if (operation === PLUS) {
                val = Ary.getInstance().plus(value, opv, ret);
            } else if (operation === SUBTRACT) {
                val = Ary.getInstance().subtract(value, opv, ret);
            }
        }

        return `${mark}${name}：${val || "--"}`;
    }

}