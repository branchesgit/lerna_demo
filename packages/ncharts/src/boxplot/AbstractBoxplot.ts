import nzyextend from "hqjlcommon/utils/extend";
import IFactory from "../IFactory";
import {IMode, IOptions} from "../ICharts";
import ModeFactory from "../factories/mode/ModeFactory";

export default abstract class AbstractBoxplot implements IFactory {

    options;

    initialize(options: IOptions) {
        this.options = options;
        const option = nzyextend(true, this.getOption(), this.handleOption(options));
        return option;
    }

    //
    abstract handleOption(options: IOptions): any;

    private getOption() {
        const modeObj: IMode = ModeFactory.getInstance().getMode(this.options);

        return {
            tooltip: {
                trigger: "item"
            },
            [modeObj.x]: {
                splitArea: {
                    show: true
                },
                data: []
            },

            [modeObj.y]: {
                axisLine: {
                    show: true
                },
                axisTick: {
                    show: true
                },
                splitArea: {
                    show: true
                }
            },

            series: [
                {
                    name: "boxplot",
                    type: "boxplot",
                    tooltip: {
                        formatter(param) {
                            return [
                                param.name + ": ",
                                "最大值区间: " + param.data[5],
                                "上四分位: " + param.data[4],
                                "中位数: " + param.data[3],
                                "下四分位: " + param.data[2],
                                "最小值区间: " + param.data[1]
                            ].join("<br/>");
                        }
                    }
                },
                {
                    name: "outlier",
                    type: "scatter",
                    tooltip: {
                        formatter(param) {
                            return [
                                "异常值：",
                                "分数：" + param.value[1]
                            ].join("<br/>");
                        }
                    }
                }
            ]
        };
    }
}
