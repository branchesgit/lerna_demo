// import AbstractRadar from "@/radar/AbstractRadar";
// import {IEnrich, IExtra, IOptions} from "@/ICharts";
// import Data from "@/util/Data";
// import RadarDataFactory from "@/factories/input/radar/RadarDataFactory";
// import {IDataFactory} from "@/factories/input/radar/IDataFactory";
// import {INDICATOR, OPTION, POINT, RADAR, SERIES} from "@/const";
// import EnrichFactory from "@/enriches/EnrichFactory";

import AbstractRadar from "./AbstractRadar";
import Data from "../util/Data";
import {INDICATOR, OPTION, RADAR, SERIES} from "../const";
import {IDataFactory} from "../factories/input/radar/IDataFactory";
import RadarDataFactory from "../factories/input/radar/RadarDataFactory";
import {IEnrich, IExtra, IOptions} from "../ICharts";
import EnrichFactory from "../enriches/EnrichFactory";

/**
 *  由于雷达图的样式较少， 缺少了样式工厂与数据工厂结合的逻辑，
 *  直接调用数据处理工厂接口。
 */
export default class Radar extends AbstractRadar {
    // 处理定制话的 options;
    handleOption(options) {
        const sources = this.handleSource(options);
        Data.getInstance().set("global.sources", sources, options);

        const extra = {sources};
        this.handleIndicator(extra, options);
        this.handleRadarData(extra, options);

        const series = Data.getInstance().get([OPTION, SERIES], options);
        this.enrichSeries(series, options);

        return options.option;
    }

    private getDataFactory(options): IDataFactory {
        return RadarDataFactory.getInstance().getDataFactory(options);
    }

    // 处理指标以及最大值的处理；
    private handleIndicator(extra: IExtra, options: IOptions) {
        const dataFactory = this.getDataFactory(options);

        if (!dataFactory) {
            return;
        }

        const indicators = dataFactory.handleIndicator(extra, options);
        Data.getInstance().set([OPTION, RADAR, INDICATOR], indicators, options);
    }

    // 处理数据逻辑
    private handleRadarData(extra: IExtra, options: IOptions) {
        const dataFactory = this.getDataFactory(options);
        dataFactory && dataFactory.handleRadarData(extra, options);
    }

    // 处理数据源的逻辑基本相同；
    private handleSource(options: IOptions) {
        const dataFactory = this.getDataFactory(options);
        return dataFactory && dataFactory.handleSource(options);
    }

    private enrichSeries(series, options: IOptions) {
        const enriches: IEnrich[] = Data.getInstance().get("global.enriches", options);
        let enrichSeries = [];

        if (enriches) {
            // 遍历每个enrich处理，附加series可以返回过来
            enriches.forEach((enrich, _) => {
                const enseries = EnrichFactory.getInstance().handleEnrich(enrich, series, options);

                if (enseries) {
                    enrichSeries = enrichSeries.concat(Array.isArray(enseries) ? enseries : [enseries]);
                }
            });
        }

        if (enrichSeries.length) {
            series = series.concat(enrichSeries);
        }

        return series;
    }
}
