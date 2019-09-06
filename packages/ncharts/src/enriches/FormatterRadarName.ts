import {IEnrichSerie} from "./IEnrichSerie";
import {ENRICH_FORMATTER_RADAR_NAME} from "./const";
import {IEnrich, IOptions} from "../ICharts";
import Data from "../util/Data";
import {FORMATTER, NAME, OPTION, RADAR} from "../const";
import Type from "../util/Type";
import LabelHandle from "../util/LabelHandle";


/**
 * author: branches
 * 由于指标的长度不确定性，有必要进行换行处理；
 */
export default class FormatterRadarName implements IEnrichSerie {

    getEnrichSymbol(): string {
        return ENRICH_FORMATTER_RADAR_NAME;
    }

    // 处理字符过长，需要换行；
    handleEnrich(enrich: IEnrich, series, options: IOptions) {
        let dins = Data.getInstance();
        let name = dins.get([OPTION, RADAR, NAME], options);
        name = dins.isEmptyObj(name) || this.getDefaultRadarName();
        const fn = name[FORMATTER];

        // 如果配置了fn的话，那么就是有了，那么不用操作；
        if (Type.getInstance().isFunction(fn)) {
            return;
        }

        const {max, rich = "left"} = enrich;
        name[FORMATTER] = text => {
            text = LabelHandle.getInstance().cutName(text, max);
            return `{${rich}|${text}}`
        }

        Data.getInstance().set([OPTION, RADAR, NAME], name, options);
    }

    // 获取对应的默认的配置；
    private getDefaultRadarName() {
        return {
            textStyle: {
                color: '#fff',
                backgroundColor: '#999',
                borderRadius: 3,
                padding: [3, 5]
            },

            rich: {
                left: {
                    align: 'left',
                },
            }
        }
    }

}