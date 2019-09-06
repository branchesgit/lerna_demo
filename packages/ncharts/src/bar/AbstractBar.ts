/**
 * 柱状图的基类
 */
import {utils} from "hqjlcommon";
import IFactory from "../IFactory";
import {IMode, IOptions} from "../ICharts";
import ModeFactory from "../factories/mode/ModeFactory";

export default abstract class AbstractBar implements IFactory {

    options;

    /**
     * 传入用户的配置信息，将处理后的options和bar的默认options合并并返回
     * @param options 用户配置的options
     */
    initialize(options: IOptions) {
        this.options = options;
        const option = utils.nzyextend(true, this.getOption(), this.handleOption(options));

        return option;
    }

    abstract handleOption(options: IOptions): any;

    /**
     * 根据chart方向获取bar的默认options配置
     */
    getOption() {
        const options = this.options;
        const modeObj: IMode = ModeFactory.getInstance().getMode(options);

        const option = {
            title: {
                left: "center"
            },
            tooltip: {
                trigger: modeObj.x.toLowerCase().substring(1, modeObj.x.length),
                axisPointer: {            // 坐标轴指示器，坐标轴触发有效
                    type: "shadow"        // 默认为直线，可选为：'line' | 'shadow'
                },
                textStyle: {
                    align: "center"
                }
            },
            color: ["#30C0E3"],
            bar: {
                itemStyle: {
                    normal: {
                        barBorderWidth: "0",
                        barBorderColor: "#ccc"
                    },
                    emphasis: {
                        barBorderWidth: "0",
                        barBorderColor: "#ccc"
                    }
                }
            },
            series: [{
                type: "bar",
                data: [],

            }],
            [modeObj.x]: this.getXAxis(),
            [modeObj.y]: this.getYAxis(),
        };

        return option;
    }

    /**
     * 默认的category轴配置
     */
    getXAxis() {
        return {
            type: "category",
            data: [],
            name: "",
            silent: false,
            splitLine: {
                show: false
            },
            splitArea: {
                show: false
            },
            axisTick: {
                show: false
            },
            axisLabel: {
                interval: 0
            },
            axisLine: {
                show: true,
                onZero: true
            }
        };
    }

    /**
     * 默认的value轴配置
     */
    getYAxis() {
        return {
            type: "value",
            axisLine: {
                show: false
            },
            axisTick: {
                show: false
            },
            axisLabel: {
                show: true
            },
            splitLine: {
                show: false
            },
            splitArea: {
                show: false,
                areaStyle: {
                    color: [
                        "rgba(250,250,250,0.3)",
                        "rgba(200,200,200,0.3)"
                    ]
                }
            }
        };
    }
}
