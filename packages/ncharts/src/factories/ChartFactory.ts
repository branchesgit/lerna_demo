import {BAR_TYPE, BOXPLOT_TYPE} from "../config/config";
import {IOptions} from "../ICharts";
import Bar from "../bar/Bar";
import Boxplot from "../boxplot/Boxplot";
import Radar from "../radar/Radar";
import {RADAR} from "../const";
import IFactory from "../IFactory";

export default class ChartFactory {

    private constructor() {
    }

    private static instance: ChartFactory | null = null;

    static getInstance(): ChartFactory {
        if (!ChartFactory.instance) {
            ChartFactory.instance = new ChartFactory();
        }

        return ChartFactory.instance;
    }

    type2ChartMap = {
        [BAR_TYPE]: new Bar(),
        [BOXPLOT_TYPE]: new Boxplot(),
        [RADAR]: new Radar(),
    };

    getChartFactory(type, options: IOptions) {
        const chartIns: IFactory = this.type2ChartMap[type];

        if (chartIns) {
            return chartIns.initialize(options);
        } else {
            throw new Error(`ncharts lib does not implements ${type} chart`);
        }
    }

}
