import {IExtra, IOptions} from "../../ICharts";
import Data from "../../util/Data";
import Type from "../../util/Type";
import {OPTION, POINT, SERIES} from "../../const";
import {STACK_BAR} from "./const";
import nzyextend from "hqjlcommon/utils/extend";
import {IChartDataFactory} from "./IChartDataFactory";
import IBarDataFactory from "../input/bar/IBarDataFactory";
import BarDataFactory from "../input/bar/BarDataFactory";

/**
 *  堆积状图，
 *  样式控制通过NMulti自身来处理，
 *  主要的是需要指定输入的数据格式，处理出目标数据格式；
 *  输入的数据支持放在 input 文件夹里；
 */
export default class StackFactory implements IChartDataFactory {
    // 获取legend[extra={sources}]
    handleLegends(extra: IExtra, options: IOptions) {
        const dataFactory: IBarDataFactory = this.getBarDataFactory(options);
        dataFactory.handleLegends(extra, options);
        // handle selected
        this.handleSelected(options);
    }

    private handleSelected(options: IOptions) {
        const selected = Data.getInstance().get("option.legend.initSelected", options)
            || Data.getInstance().get("options.global.series.initSelected", options) || [];
        const data = Data.getInstance().get("option.legend.data", options);

        if (Type.getInstance().isArray(selected) && selected.length) {
            const newSelected = {};
            (data || []).map((s, ind) => {
                newSelected[s] = selected.indexOf(ind) >= 0;
            });
            Data.getInstance().set("option.legend.selected", newSelected, options);
        }
    }

    // 预留一个接口，做些繁琐的操作；
    after(extra: IExtra, options) {
        this._enrichTooltip(extra.sources, options);
    }

    getSymbol(): string {
        return STACK_BAR;
    }

    handleSource(options: IOptions): any[] {
        const dataFactory: IBarDataFactory = this.getBarDataFactory(options);
        return dataFactory.handleSource(options);
    }

    handleLabels(extra: IExtra, options: IOptions) {
        const dataFactory: IBarDataFactory = BarDataFactory.getInstance().getDataFactory(options);
        dataFactory.handleLabels(extra, options);
    }

    //
    handleSerieData(extra: IExtra, options: IOptions): any[] {
        const series = Data.getInstance().get([OPTION, SERIES].join(POINT), options);
        const {levelIdx} = extra;

        if (series && series.length) {
            //  模板默认取第一项；
            const serie = levelIdx >= series.length ? series[0] : series[levelIdx];
            const dataInfo = serie.data;

            const dataFactory: IBarDataFactory = this.getBarDataFactory(options);
            const values = dataFactory.getSerieData(extra, options);

            if (dataInfo.enrich) {
                values.forEach((v, _) => {
                    values[_] = dataInfo.enrich(v, _, levelIdx);
                });
            }

            return values;

        } else {
            throw new Error("serie's template lose series information");
        }
    }

    // 按names数量生成sereis个数
    getSeries(extra: IExtra, options: IOptions): any[] {
        const dataFactory: IBarDataFactory = this.getBarDataFactory(options);
        const names = dataFactory.getSeries(extra, options);

        let series: any[] = [];
        const templates = Data.getInstance().get([OPTION, SERIES].join(POINT), options);
        const len = templates && templates.length;

        // 目前还不需要支持多维度的堆积图， dataIndex 总是为0；
        if (names && names.length) {
            series = names.map((name, ind) => {
                const seriesInd = name && typeof (name.seriesIndex) === "number" ? name.seriesIndex : ind;

                const base = len ?
                    len > seriesInd ? templates[seriesInd] : templates[0] :
                    {type: "bar", stack: "s", data: []};

                const seriesName = Type.getInstance().isObject(name) ? (name.name || "") : name;

                return nzyextend(true, {name: seriesName, dataIndex: 0}, base);
            });
        }

        return series;

    }

    _enrichTooltip(sources, options) {
        const tooltip = Data.getInstance().get("option.tooltip", options);

        if (tooltip) {
            const formatter = tooltip.formatter || (params => {
                const arr: any[] = [];
                for (let i = 0; i < params.length; i++) {
                    const {name, seriesName, value, marker} = params[i];
                    if (i === 0) {
                        arr.push(`${name}`);
                    }
                    arr.push(`${marker}${seriesName}: ${value}`);
                }

                return arr.join("<br/>");
            });

            Data.getInstance().set("option.tooltip.formatter", formatter, options);
        }
    }

    private getBarDataFactory(options) {
        return BarDataFactory.getInstance().getDataFactory(options);
    }
}
