import IBarDataFactory from "./IBarDataFactory";
import {DATA, GLOBAL, KEY, LEGEND, OPTION, ORIGDATA, PLUS, POINT, SERIES, SOURCE} from "../../../const";
import {IExtra, IMode, IOptions} from "../../../ICharts";
import Data from "../../../util/Data";
import Type from "../../../util/Type";
import Ary from "../../../util/Ary";
import Name from "../util/Name";
import ModeFactory from "../../mode/ModeFactory";
import {GROUP_IN_BEAN} from "./const";
import Sources from "../util/Sources";

/**
 * 数据模板如下：: [
 * {
 *  "classID": 1,
 *  "className": "1班",
 *  "stuNum": 29,
 *  "completedStu": 2
 * }
 * ]
 */
export default class GroupInBean implements IBarDataFactory {

    getSerieData(extra: IExtra, options: IOptions): any[] {
        const {sources, levelIdx} = extra;
        const series = Data.getInstance().get([OPTION, SERIES].join(POINT), options) || [];
        const len = series.length;
        let values = [];

        if (len) {
            const tmp = levelIdx < len ? series[levelIdx] : series[0];
            const dataInfo = tmp[DATA];
            const tins = Type.getInstance();

            if (tins.isArray(dataInfo)) {
                values = dataInfo;
            } else if (tins.isFunction(dataInfo)) {
                values = dataInfo(sources);
            } else if (tins.isObject(dataInfo)) {

                const {key, operation} = dataInfo;
                // 有运算的话，那么key必须是数组了；
                if (key && tins.isArray(key)) {

                    const origs = [];
                    (key || []).map(k => {
                        origs.push(Ary.getInstance().getLastList(k, sources));
                    });

                    // 计算
                    if (operation) {
                        const bplus = operation === PLUS;

                        values = origs[0].map((v, _) => {
                            let val = parseFloat(v);

                            for (let i = 1; i < origs.length; i++) {
                                if (bplus) {
                                    val += parseFloat(origs[i][_]);
                                } else {
                                    val -= parseFloat(origs[i][_]);
                                }
                            }

                            return val;
                        });

                        Data.getInstance().set(ORIGDATA, origs, tmp);
                    }

                } else {
                    // 获取唯一的一组值；
                    values = Ary.getInstance().getLastList(key, sources);
                }
            }

        } else {
            throw new Error("options.option.series not config");
        }

        return values;
    }


    getSeries(extra: IExtra, options: IOptions): any[] {
        return Name.getInstance().getSeriesNames(extra, options, this.getLevelNames);
    }

    handleLabels(extra: IExtra, options: IOptions): void {
        const mode: IMode = ModeFactory.getInstance().getMode(options);
        // 取出x轴的信息；
        const axises = Data.getInstance().get([OPTION, mode.x].join(POINT), options);
        const sourceInfo = this.getSourceInfo(options);

        if (Type.getInstance().isArray(axises)) {
            axises.map(function (axis, _) {
                Name.getInstance().handleLabelInfo(axis, extra, sourceInfo);
            });
        } else {
            Name.getInstance().handleLabelInfo(axises, extra, sourceInfo);
        }
    }

    handleLegends(extra: IExtra, options: IOptions): void {
        const legendInfo = Data.getInstance().get([OPTION, LEGEND, DATA].join(POINT), options);

        if (legendInfo) {
            const names = this.getLevelNames(legendInfo, extra);

            Data.getInstance().set([OPTION, LEGEND, DATA].join(POINT), names, options);
        }
    }

    private getLevelNames(conf, extra: IExtra) {
        const key = Data.getInstance().get([KEY].join(POINT), conf);
        const {sources} = extra;
        return Ary.getInstance().getLastList(key, sources);
    }

    getSymbol(): string {
        return GROUP_IN_BEAN;
    }

    handleSource(options: IOptions): any[] {
        return Sources.getInstance().handleSource(options);
    }

    private getSourceInfo(options: IOptions) {
        const sourceInfo = Data.getInstance().get([GLOBAL, SOURCE].join(POINT), options);
        return sourceInfo;
    }
}