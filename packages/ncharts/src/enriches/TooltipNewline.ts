import { IEnrichSerie } from "./IEnrichSerie";
import { IOptions, IEnrich } from "../ICharts";
import Data from "../util/Data";
import Type from "../util/Type";
import {ENRICH_TOOLTIP_NEWLINE} from "../enriches/const";
// tooltip换行
// 虽然tooltip可以超出图表，但是slick外层必须overflow:hidden，使得不能超出卡片
export default class TooltipNewline implements IEnrichSerie {
    getEnrichSymbol(): string {
        return ENRICH_TOOLTIP_NEWLINE;
    }

    handleEnrich(enrich: IEnrich, series, options: IOptions) {
        let formatter = Data.getInstance().get("option.tooltip.formatter", options);
        const dimensions = Data.getInstance().get("global.series.names", options);
        const dimlen = dimensions && dimensions.length || 0;
        let maxlen = enrich.maxlen || 18;
        // 1.对dim maxlen取整组，保证一组的值不分开
        if (dimlen) {
            maxlen = enrich.maxlen ? Math.ceil(enrich.maxlen / (dimlen + 1)) : 2;
            maxlen = maxlen * (dimlen + 1);
        }
        // 没有formatter的话生成formatter
        if (!formatter) {
            formatter = params => {
                const arr: any[] = [];
                if (Type.getInstance().isObject(params)) {
                    params = [params];
                }
                (params || []).map((item, index) => {
                    if (index === 0 && item.axisValueLabel) {
                        arr.push(item.axisValueLabel);
                    }
                    const tIns = Type.getInstance();
                    if (dimlen) {
                        arr.push(item.seriesName);
                        dimensions.map((dim, ind) => {
                            let val = item.value && item.value[ind] || "";
                            if (tIns.isNumerical(enrich.fixed) && tIns.isNumerical(val)) {
                                val = val.toFixed(enrich.fixed);
                            }
                            arr.push(item.marker + dim + "：" + val);
                        });
                    } else {
                        const val = tIns.isNumerical(enrich.fixed) && tIns.isNumerical(item.value) ?
                            item.value.toFixed(enrich.fixed) : item.value;
                        arr.push(item.marker + item.seriesName + "：" + val + enrich.name || "");
                    }
                });
                return arr.join("<br/>");
            };
        }
        if (formatter && Type.getInstance().isFunction(formatter)) {
            const newformatter = (...params) => {
                const str = formatter(...params);
                const strarr = str.split("<br/>");
                if (strarr && strarr.length > 1) {
                    // 提取出第一个[一般是category名称]
                    const firstitem = strarr.splice(0, 1);
                    const newarr: any[] = [];
                    const len = strarr.length;
                    // count: 一行几个
                    // 对dim的:len/(groupNum*oneGrouplen)=1行几组
                    // 第几组idx/(dimlen+1),的第几行idx%(dimlen+1)
                    const count = Math.ceil(len / maxlen);
                    strarr.map((item, idx) => {
                        // 对于普通的,dimlen=0
                        const groupInd = Math.floor(idx / (dimlen + 1));
                        const idxInGroup = idx % (dimlen + 1);
                        const rowforitem = Math.floor(groupInd / count) * (dimlen + 1) + idxInGroup;
                        newarr[rowforitem] = newarr[rowforitem] || "";
                        let styles = ["display:inline-block", "padding-right:10px"];
                        if (enrich.styles) {
                            styles = styles.concat(enrich.styles || []);
                        }
                        newarr[rowforitem] +=
                            `<span style='${styles.join(";")}'>${item}</span>`;
                    });
                    return `${firstitem}<br/><span style='display:inline-block;text-align:left;'>\
                    ${newarr.join("<br/>")}</span>`;
                } else {
                    return str;
                }
            };
            Data.getInstance().set("option.tooltip.formatter", newformatter, options);
            Data.getInstance().set("option.tooltip.confine", true, options);
        }
    }
}
