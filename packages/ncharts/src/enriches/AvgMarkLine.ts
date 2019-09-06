/**
 * 平均值虚线功能
 */
import {IEnrichSerie} from "./IEnrichSerie";
import {ENRICH_AVGLINE} from "./const";
import {IEnrich, IMode, IOptions} from "../ICharts";
import Data from "../util/Data";
import ModeFactory from "../factories/mode/ModeFactory";
import {DATA} from "../const";
import Type from "../util/Type";

// import {IEnrichSerie} from "@/enriches/IEnrichSerie";
// import {IEnrich, IMode, IOptions} from "@/ICharts";
// import Data from "@/util/Data";
// import ModeFactory from "@/factories/mode/ModeFactory";
// import {DATA, POINT} from "@/const";
// import Type from "@/util/Type";
// import {ENRICH_AVGLINE} from "@/enriches/const";

export default class AvgMarkLine implements IEnrichSerie {
    // 标识
    getEnrichSymbol(): string {
        return ENRICH_AVGLINE;
    }

    handleEnrich(enrich: IEnrich, series, options: IOptions) {
        const value = this.getValue(enrich, series);
        const markLine = Data.getInstance().get("markLine", enrich) || this.getDefaultMarkLine(options);

        const mode: IMode = ModeFactory.getInstance().getMode(options);
        const dataIns = Data.getInstance();
        dataIns.set("data", [{[mode.y]: value}], markLine);

        if (series && series.length) {
            dataIns.set("markLine", markLine, series[0]);
        }

        return null;
    }

    /**
     * 从data获取数据
     * or 根据值进行自我运算；
     */
    private getValue(enrich: IEnrich, series) {
        let data = enrich.data;
        data = Data.getInstance().getSources(data);

        if (!data) {
            // 一般情况下是单柱状图；
            let values = Data.getInstance().get([0, DATA], series);
            const len = values && values.length || 0;
            let total = 0;

            if (len) {
                // 判断值是单纯的数值还是对象；
                if (Type.getInstance().isObject(values[0])) {
                    values = values.map(v => v.value);
                }

                values.map(v => total += parseFloat(v) || 0);
                data = total / len;
            }
        }

        return Number(data);
    }

    // 常量配置部分
    getDefaultMarkLine(options: IOptions) {
        return {
            lineStyle: {
                normal: {
                    color: ["#169FF4"],
                    type: "dashed"
                }
            }
        };
    }
}
