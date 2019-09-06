import {IExtra, IMode, IOptions} from "../../../ICharts";
import Data from "../../../util/Data";
import Type from "../../../util/Type";
import {DATA, GLOBAL, KEY, LEGEND, OPTION, POINT, SERIES, SOURCE} from "../../../const";
import Ary from "../../../util/Ary";
import IBarDataFactory from "./IBarDataFactory";
import Merge from "../util/Merge";
import ModeFactory from "../../mode/ModeFactory";
import Name from "../util/Name";
import {GROUP_IN_LEVELS} from "./const";


/**
 *
 * 数据模板：
 *  [
 *  {
 *    "examID"： 0,
 *    "examName"： "加权考试",
 *    "detail"： [
 *      {
 *        "id"： 1,
 *        "name"： "1班",
 *        "clsRankLevels"： [
 *          {
 *            "rankLevel"： 1,
 *            "rankLevelName"： "第一梯队",
 *            "maxScore"： 548.6,
 *            "minScore"： 508.2,
 *            "median"： 528.35,
 *            "avgScore"： 527.8
 *          },
 *          {
 *             "rankLevel": 2,
 *             "rankLevelName": "第二梯队",
 *             "maxScore": 548.6,
 *             "minScore": 508.2,
 *             "median": 528.35,
 *             "avgScore": 527.8
 *           }
 *        ]
 *      }
 *    ]
 *  }
 *]
 */
// Note: 一个集合包含了多维度的数据，并将多维度的堆积在同一个柱子上；
export default class GroupInLevels implements IBarDataFactory {

    /**
     * ../../..param {IExtra} extra
     * ../../..param {IOptions} options
     * ../../..returns {any[]}
     */
    getSerieData(extra: IExtra, options: IOptions): any[] {
        const {sources, levelIdx} = extra;
        const series = Data.getInstance().get([OPTION, SERIES].join(POINT), options) || [];

        if (series.length) {
            const serie = levelIdx >= series.length ? series[0] : series[levelIdx];
            const dataInfo = Data.getInstance().get(DATA, serie);
            let values = [];

            if (dataInfo) {
                const tins = Type.getInstance();

                if (tins.isArray(dataInfo)) {
                    values = dataInfo;
                } else if (tins.isFunction(dataInfo)) {
                    values = dataInfo(sources);
                } else if (tins.isObject(dataInfo)) {
                    const len = sources && sources.length || 0;

                    if (len > 1) {
                        // not implements
                        const vs = [];

                        if (this.isMergeSourceData(options)) {
                            for (let i = 0; i < len; i++) {
                                vs[i] = this.getSameLevelValues(levelIdx, dataInfo, [sources[i]], extra, options);
                            }

                            values = Merge.getInstance().mergeDimensions(vs);
                            Merge.getInstance().removeAndUpdateIndex(values);

                        } else {
                            throw new Error("not implements multi dimension stack bar...");
                        }

                    } else {
                        values = this.getSameLevelValues(levelIdx, dataInfo, sources, extra, options);
                    }
                }
            }

            return values;

        } else {
            throw new Error("series not config~");
        }

    }

    private getLabelLen(extra: IExtra, options: IOptions) {
        const mode: IMode = ModeFactory.getInstance().getMode(options);
        const labels = Data.getInstance().get([OPTION, mode.x, DATA].join(POINT), options);
        const bmerge = this.isMergeSourceData(options);
        let len = labels.length;

        if (bmerge) {
            const l = (extra.sources || []).length || 1;
            len /= l;
        }

        return len;
    }

    // key: detail.clsRankLevels.avgScore;
    private getSameLevelValues(levelIdx, dataInfo, sources, extra, options) {
        let {key, value} = dataInfo;

        const rets = [];
        const llen = this.getLabelLen(extra, options);

        let vkey: string;

        for (let i = 0; i < llen; i++) {
            if (Type.getInstance().isArray(value)) {

                if (value.length) {
                    let vs = [];

                    for (let j = 0; j < value.length; j++) {
                        vkey = this.getLevelKey(i, levelIdx, `${key}.${value[j]}`);
                        vs.push(parseFloat(Data.getInstance().get(vkey, sources)))
                    }

                    vs.push(i);

                    rets.push(vs);
                }

            } else {
                if (value) {
                    key = [key, value].join(POINT);
                    value = "";
                }

                vkey = this.getLevelKey(i, levelIdx, key);
                rets.push(parseFloat(Data.getInstance().get(vkey, sources)));
            }
        }

        return rets;
    }

    // 获取到对应的key串，方便取值；
    private getLevelKey(labelIdx, levelIdx, key = "") {
        const keys = key.split(POINT);
        const idxs = [0, labelIdx, levelIdx];
        let idx = 0;
        const len = keys.length;

        for (let i = 0; i < len; i++) {
            keys.splice(idx, 0, idxs[i]);
            idx += 2;
        }

        return keys.join(POINT);
    }

    /**
     * ../../..param {IExtra} extra
     * ../../..param {IOptions} options
     * ../../..returns {any[]}
     * 通过获取 option.legend or global.series 配置信息，来获取对应的series,
     * 优先使用 global.series
     */
    getSeries(extra: IExtra, options: IOptions): any[] {
        const ins: Data = Data.getInstance();
        const conf = ins.get([GLOBAL, SERIES].join(POINT), options);
        let names;
        const tins: Type = Type.getInstance();

        if (conf) {
            names = tins.isFunction(conf) ? conf(extra.sources) :
                tins.isArray(conf) ? conf : this.getLevelNames(conf, extra);
        } else {
            names = Data.getInstance().get([OPTION, LEGEND, DATA].join(POINT), options);
        }

        return names;
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
        const ins: Data = Data.getInstance();
        const conf = ins.get([GLOBAL, SERIES].join(POINT), options) || ins.get([OPTION, LEGEND].join(POINT), options);
        const tins: Type = Type.getInstance();
        const names = tins.isFunction(conf) ? conf(extra.sources) :
        tins.isArray(conf) ? conf : this.getLevelNames(conf, extra);

        Data.getInstance().set([OPTION, LEGEND, DATA].join(POINT), names, options);
    }

    private getLevelNames(conf, extra: IExtra) {
        const key = Data.getInstance().get([KEY].join(POINT), conf);
        const {sources} = extra;
        return Ary.getInstance().getLastList(key, sources);
    }

    getSymbol(): string {
        return GROUP_IN_LEVELS;
    }

    handleSource(options: IOptions): any[] {
        const source = Data.getInstance().get([GLOBAL, SOURCE].join(POINT), options);
        const typeIns = Type.getInstance();
        const newSource = typeIns.isFunction(source) ? source() :
            typeIns.isArray(source) ? source :
                source.key ? Data.getInstance().get(source.key, source.data) : source.data;

        const newArySource = typeIns.isArray(newSource) ? newSource : [newSource];
        // 数据补充
        if (typeIns.isObject(source) && source.before && typeIns.isFunction(source.before)) {
            source.before(newArySource, options);
        }
        return newArySource;
    }

    private isMergeSourceData(options: IOptions) {
        const sourceInfo = this.getSourceInfo(options);
        return sourceInfo && sourceInfo.merge;
    }

    private getSourceInfo(options: IOptions) {
        const sourceInfo = Data.getInstance().get([GLOBAL, SOURCE].join(POINT), options);
        return sourceInfo;
    }
}
