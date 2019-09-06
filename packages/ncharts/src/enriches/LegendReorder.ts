import { IEnrichSerie } from "./IEnrichSerie";
import { IEnrich, IOptions } from "../ICharts";
import Data from "../util/Data";
import {ENRICH_LEGEND_REDORDER} from "./const";

// 图例顺序调整
export default class LegendReorder implements IEnrichSerie {
    getEnrichSymbol(): string {
        return ENRICH_LEGEND_REDORDER;
    }

    handleEnrich(enrich: IEnrich, series, options: IOptions) {
        const { reorder } = enrich;
        const legendData = Data.getInstance().get("option.legend.data", options) || [];
        if (reorder instanceof Array) {
            let newData = legendData || [];
            (reorder || []).map((orderItem, orderInd) => {
                const { type, inds = [] } = orderItem;
                if (type === "reverse") {
                    newData = newData.reverse();
                } else {
                    const otherInds: number[] = [];
                    newData.map((item, itemInd) => {
                        if (inds.indexOf(itemInd) < 0) {
                            otherInds.push(itemInd);
                        }
                    });
                    const resInds = type === "prefix" ? inds.concat(otherInds)
                        : otherInds.concat(inds);
                    const resData = resInds.map(resInd => newData[resInd]);
                    newData = resData;
                }
            });
            Data.getInstance().set("option.legend.data", newData, options);
        } else {
            const newData = legendData.map(reorder);
            Data.getInstance().set("option.legend.data", newData, options);
        }
    }
}
