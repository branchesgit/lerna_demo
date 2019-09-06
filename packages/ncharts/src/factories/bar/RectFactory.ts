import {IChartDataFactory} from "./IChartDataFactory";
import {IExtra, IOptions} from "../../ICharts";
import {CUSTOM_RECT_BOX} from "./const";
import {XAXIS} from "../../factories/mode/ModeFactory";
import Data from "../../util/Data";
import ModeFactory from "../../factories/mode/ModeFactory";
import nzyextend from "hqjlcommon/utils/extend";
import * as echarts from "echarts";
import Type from "../../util/Type";
import IBarDataFactory from "../input/bar/IBarDataFactory";
import BarDataFactory from "../input/bar/BarDataFactory";
const MIN_GAP = 7;
/**
 *  自定义柱状图表,具体样式参考成绩分析班级梯队
 */
export default class RectFactory implements IChartDataFactory {
    after(extra: IExtra, options) {
        this._enrichTooltip(extra.sources, options);
    }

    getSeries(extra: IExtra, options: IOptions): any[] {
        const dataFactory: IBarDataFactory = this.getBarDataFactory(options);
        const names = dataFactory.getSeries(extra, options);

        let series: any[] = [];
        const templates = Data.getInstance().get("option.series", options);
        const dimensions = Data.getInstance().get("global.series.names", options);
        const len = templates && templates.length;

        if (names && names.length) {

            series = names.map((name, ind) => {
                const base = len ? len > ind ? templates[ind] : templates[0] : {type: "custom", data: []};
                const mode = ModeFactory.getInstance().getMode(options);
                const xdirect = mode.x === XAXIS;
                const encode = (base.encode && base.encode[xdirect ? "y" : "x"])
                    || (base.encode && base.encode.axis)
                    || [0, 1];

                // rect部分
                const renderItem = this.getRenderItem(xdirect, encode);

                return nzyextend(true, {
                    name,
                    renderItem,
                    encode: {
                        [xdirect ? "y" : "x"]: encode,
                        // 最后会放入类目轴序号作为y映射
                        [xdirect ? "x" : "y"]: dimensions && dimensions.length || 0
                    },
                    dimensions
                }, base, {type: "custom"});
            });
        }

        return series;
    }

    private getRenderItem(xdirect, encode) {
        return (params, api) => {
            const categoryIndex = params.dataIndex;
            const startvalue = api.value(encode[0]); // 上限
            const endvalue = api.value(encode[1]); // 下限
            // 得到上下中点坐标
            const start = api.coord(xdirect ? [categoryIndex, startvalue] : [startvalue, categoryIndex]);
            const end = api.coord(xdirect ? [categoryIndex, endvalue] : [endvalue, categoryIndex]);
            // 长度
            const gap = api.size([0, 1])[xdirect ? 0 : 1] * 0.6;
            const zeroheight = (xdirect && (end[1] === start[1])) || ((!xdirect) && (end[0] === start[0]));
            const rectShape = echarts.graphic.clipRectByRect(xdirect ? {
                x: start[0] - gap / 2,
                y: zeroheight ? start[1] + MIN_GAP : start[1],
                height: zeroheight ? MIN_GAP : end[1] - start[1],
                width: gap
            } : {
                    x: zeroheight ? start[0] + MIN_GAP : start[0],
                    y: start[1] - gap / 2,
                    width: zeroheight ? MIN_GAP : end[0] - start[0],
                    height: gap
                }, {
                    x: params.coordSys.x,
                    y: params.coordSys.y,
                    width: params.coordSys.width,
                    height: params.coordSys.height
                });
            const style = api.style();
            // 保留2位小数，如果需要传参再提取
            style.text = style.text && style.text.toFixed ? style.text.toFixed(2) : style.text;
            if (zeroheight) {
                style.fill = "transparent";
            }
            return rectShape && {
                type: "rect",
                shape: rectShape,
                style
            };
        };
    }

    getSymbol(): string {
        return CUSTOM_RECT_BOX;
    }

    handleLabels(extra: IExtra, options: IOptions) {
        const dataFactory: IBarDataFactory = this.getBarDataFactory(options);
        dataFactory.handleLabels(extra, options);
    }

    handleLegends(extra: IExtra, options: IOptions) {
        const dataFactory: IBarDataFactory = this.getBarDataFactory(options);
        dataFactory.handleLegends(extra, options);
    }

    handleSerieData(extra: IExtra, options: IOptions): any[] {
        const series = Data.getInstance().get("option.series", options);
        const {levelIdx} = extra;

        if (series && series.length) {
            //  模板默认取第一项；
            const serie = levelIdx >= series.length ? series[0] : series[levelIdx];
            const dataFactory: IBarDataFactory = this.getBarDataFactory(options);
            const dataInfo = serie.data;
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

    handleSource(options: IOptions): any[] {
        const dataFactory: IBarDataFactory = this.getBarDataFactory(options);
        return dataFactory.handleSource(options);
    }

    private getBarDataFactory(options) {
        return BarDataFactory.getInstance().getDataFactory(options);
    }

    _enrichTooltip(sources, options) {
        const tooltip = Data.getInstance().get("option.tooltip", options);
        const dimensions = Data.getInstance().get("global.series.names", options) || [];

        if (tooltip) {
            const formatter = tooltip.formatter || (params => {
                const res: string[] = [];
                if (Type.getInstance().isObject(params)) {
                    params = [params];
                }
                (params || []).map((s, ind) => {
                    if (ind === 0 && s.axisValue) {
                        res.push(s.axisValue);
                    }
                    res.push(s.seriesName);
                    const data = s && s.data || [];
                    (dimensions || []).map((dim, dimind) => {
                        res.push(`${s.marker}${dim}: ${s.data[dimind]}`);
                    });
                });
                return res.join("<br/>");
            });

            Data.getInstance().set("option.tooltip.formatter", formatter, options);
        }
    }
}
