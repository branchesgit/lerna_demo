import { IEnrichSerie } from "./IEnrichSerie";
import { ENRICH_LABEL_CUT } from "./const";
import { IEnrich, IOptions, IMode } from "../ICharts";
import ModeFactory from "../factories/mode/ModeFactory";
import Data from "../util/Data";
import Type from "../util/Type";
import LabelHandle from "../util/LabelHandle";
/**
 * 类目轴文本长度切割，需要在DataZoom前执行
 * 不传长度默认18，中文字符占2个长度
 */
export default class LabelCut implements IEnrichSerie {
    getEnrichSymbol(): string {
        return ENRICH_LABEL_CUT;
    }

    handleEnrich(enrich: IEnrich, series, options: IOptions) {
        const mode: IMode = ModeFactory.getInstance().getMode(options);
        const axises = Data.getInstance().get(`option.${mode.x}`, options);
        const { maxlen } = enrich;
        if (Type.getInstance().isArray(axises)) {
            axises.map((axis, ind) => {
                let labels = Data.getInstance().get(`data`, axis);
                labels = this.handleLabels(labels, maxlen);
                Data.getInstance().set(`option.${mode.x}.${ind}.data`, labels, options);
            });
        } else {
            let labels = Data.getInstance().get(`option.${mode.x}.data`, options);
            labels = this.handleLabels(labels, maxlen);
            Data.getInstance().set(`option.${mode.x}.data`, labels, options);

        }
    }

    private handleLabels(labels, maxLength) {
        labels = labels && labels.map && labels.map((label, ind) => {
            if (label && label.value) {
                label.value = LabelHandle.getInstance().cutName(label.value, maxLength);
                return label;
            } else {
                return LabelHandle.getInstance().cutName(label, maxLength);
            }
        });
        return labels;
    }
}
