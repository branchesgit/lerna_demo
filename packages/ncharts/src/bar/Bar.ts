/**
 * 普通柱状图用户option处理类，扩展自AbstractBar
 */
import nzyextend from "hqjlcommon/utils/extend";
import {BAR_TYPE} from "../config/config";
import {IEnrich, IOptions} from "../ICharts";
import {IChartDataFactory} from "../factories/bar/IChartDataFactory";
import EnrichFactory from "../enriches/EnrichFactory";
import Data from "../util/Data";
import BarTypeFactory from "../factories/bar/BarTypeFactory";
import AbstractBar from "./AbstractBar";
import SerieFactory from "../factories/serie/SerieFactory";

export default class Bar extends AbstractBar {

    /**
     * 入口方法，处理用户配置的options并返回结果
     * @param options 用户配置options
     */
    handleOption(options: IOptions) {
        // 获取数据源
        const sources = this.handleDataSource(options);
        // 处理labels;
        this.handleLabels(options, sources);
        // 处理 legends
        this.handleLegends(options, sources);
        // 处理series
        let series = this.handleSeries(options, sources);
        let option = options.option || {};
        // 扩展series
        series = this.enrichSeries(series, options);
        // 合并series进入option
        option = {
            ...option,
            series
        };

        options.option = option;
        this.after(sources, options);

        return option;
    }

    /**
     * 从options种获取排序后数据源sources
     * @param options 用户配置options
     */
    private handleDataSource(options: IOptions) {
        const barDataFactory: IChartDataFactory = this.getBarTypeDataFactory(options);
        return barDataFactory && barDataFactory.handleSource(options) || [];
    }

    /**
     * 处理series.
     * @param options
     */
    private handleSeries(options: IOptions, sources) {
        // 获取option里的series
        const barDataFactory: IChartDataFactory = this.getBarTypeDataFactory(options);

        if (barDataFactory) {
            const series = barDataFactory.getSeries({sources}, options) || [];
            const targets: any[] = [];

            // 遍历并处理每一个series
            if (series.length) {
                series.forEach((serie, levelIdx) => {
                    const dataIndex = serie.dataIndex || 0;

                    // 删除 dataIndex 信息；
                    if ("dataIndex" in serie) {
                        delete serie.dataIndex;
                    }

                    serie = nzyextend(true, {}, serie);

                    const extra = {
                        serie, // 当前serie
                        levelIdx, // 堆积图的层次；
                        sources,   // 该组的数据源
                        type: BAR_TYPE, // chart类型
                        series, // 总的series数组
                        dataIndex
                    };

                    targets.push(SerieFactory.getInstance().handelSerie(extra, options));
                });
            }

            return targets;
        }

    }

    /**
     * 获取并设值category轴的labels data
     * @param options 用户配置options
     * @param sources 上一步得到的数据源
     */
    private handleLabels(options: IOptions, sources) {
        const barTypeFactory: IChartDataFactory = this.getBarTypeDataFactory(options);
        barTypeFactory.handleLabels({sources}, options);
    }

    /**
     * 处理legend
     * @param options 用户配置options
     * @param sources 前一步得到的数据源
     */
    private handleLegends(options: IOptions, sources) {
        const barTypeFactory: IChartDataFactory = this.getBarTypeDataFactory(options);
        return barTypeFactory.handleLegends({sources}, options);
    }

    /**
     * 添加丰富图表实例；
     * @param series 当前series
     * @param options 用户配置options
     */
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

    /**
     * 预留：options处理完成后的处理
     * @param sources 数据源
     * @param options 用户配置options
     */
    after(sources, options: IOptions) {
        const barTypeFactory: IChartDataFactory = this.getBarTypeDataFactory(options);
        barTypeFactory.after({sources}, options);
    }

    // 获取对应的图表展示样式指定的类型；
    private getBarTypeDataFactory(options: IOptions): IChartDataFactory {
        return BarTypeFactory.getInstance().getBarTypeFactory(options);
    }
}
