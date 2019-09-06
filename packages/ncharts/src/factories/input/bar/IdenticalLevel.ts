/**
 *  数据模板：[{
 *  "examID": 0,
 *  "examName": "加权考试",
 *  "echelon": [
 *    {
 *     "echelon": "第一梯队",
 *     "order": 1,
 *     "groups": [
 *       {
 *          "id": "10",
 *          "name": "1班",
 *          "count": 9
 *        },
 *        {
 *          "id": "11",
 *          "name": "2班",
 *          "count": 9
 *        }
 *      ]
 *    }
 *  ]
 * }]
 *  以上是数据模板，需要将对应的数据转换成目标图表数据；
 *  同一层的各种数据，聚集在一起；
 *  梯队作为legend, 也就梯队做层，  班级做为柱子梯队数据进行堆积；
 */
import {IExtra, IMode, IOptions} from "../../../ICharts";
import Data from "../../../util/Data";
import {DATA, GLOBAL, KEY, LEGEND, OPTION, POINT, SERIES, SOURCE} from "../../../const";
import Type from "../../../util/Type";
import Ary from "../../../util/Ary";
import IBarDataFactory from "./IBarDataFactory";
import ModeFactory from "../../mode/ModeFactory";
import Name from "../util/Name";
import Merge from "../util/Merge";
import {IDENTICAL_LEVEL} from "./const";

export default class IdenticalLevel implements IBarDataFactory {
    getSeries(extra: IExtra, options: IOptions): any[] {
        const ins: Data = Data.getInstance();
        let conf = ins.get([GLOBAL, SERIES].join(POINT), options) || ins.get([OPTION, LEGEND].join(POINT), options);
        const names = Type.getInstance().isArray(conf.data) ? conf.data : this.getLevelNames(conf, extra);

        return names;
    }

    private getLevelNames(conf, extra: IExtra) {
        const key = Data.getInstance().get(KEY, conf);
        const {sources} = extra;
        return Ary.getInstance().getLastList(key, sources);
    }

    /**
     *  从中取去最大长度作为 labels;
     */
    handleLabels(extra: IExtra, options: IOptions) {
        const mode: IMode = ModeFactory.getInstance().getMode(options);
        // 取出x轴的信息；
        const axises = Data.getInstance().get(`${OPTION}.${mode.x}`, options);
        const sourceInfo = this.getSourceInfo(options);

        if (Type.getInstance().isArray(axises)) {
            axises.map(function (axis, _) {
                Name.getInstance().handleLabelInfo(axis, extra, sourceInfo);
            });
        } else {
            Name.getInstance().handleLabelInfo(axises, extra, sourceInfo);
        }

    }

    handleLegends(extra: IExtra, options: IOptions) {
        const ins: Data = Data.getInstance();
        const key = ins.get([OPTION, LEGEND, KEY], options) || ins.get([GLOBAL, SERIES, KEY], options);

        const {sources} = extra;
        const names = Ary.getInstance().getLastList(key, sources);
        Data.getInstance().set([OPTION, LEGEND, DATA], names, options);
    }

    /**
     * ../../..param {IExtra} extra
     * ../../..param {IOptions} options
     * 处理层次数据； 也就是groups 里的count;
     */
    getSerieData(extra: IExtra, options: IOptions) {
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
                    const len = sources && sources.length;

                    if (len > 1) {
                        const vs = [];

                        if (this.isMergeSourceData(options)) {
                            const sourceInfo = this.getSourceInfo(options);

                            for (let i = 0; i < len; i++) {
                                vs[i] = this.getSameLevelValues(levelIdx, dataInfo, [sources[i]], extra, options);
                            }

                            values = Merge.getInstance().mergeDimensions(vs, sourceInfo);

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

    getSymbol(): string {
        return IDENTICAL_LEVEL;
    }

    handleSource(options: IOptions): any[] {
        const source = Data.getInstance().get("global.source", options);
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

    private getLabelLen(extra: IExtra, options: IOptions) {
        const mode: IMode = ModeFactory.getInstance().getMode(options);
        const labels = Data.getInstance().get([OPTION, mode.x, DATA].join(POINT), options);
        const bmerge = this.isMergeSourceData(options);
        const reallyLabels = labels.filter(v => !!v);
        let len = reallyLabels.length;

        if (bmerge) {
            const l = (extra.sources || []).length || 1;
            len /= l;
        }

        return len;
    }

    /**
     * 获取同一层次的数据；
     * 根据labels信息来确定需要的数据；
     * ../../..param levelIdx
     * ../../..param key
     * ../../..param sources
     * ../../..returns {any[]}
     */
    private getSameLevelValues(levelIdx, dataInfo, sources, extra, options): any[] {
        const {key, value} = dataInfo;
        const rets = [];
        const len = this.getLabelLen(extra, options);
        let vkey: string;

        for (let i = 0; i < len; i++) {

            if (value && value.length) {
                let vs = [];
                for (let j = 0; j < value.length; j++) {
                    vkey = this.getLevelKey(i, levelIdx, `${key}.${value[j]}`);
                    vs.push(parseFloat(Data.getInstance().get(vkey, sources)))
                }

                vs.push(i);

                rets.push(vs);
            } else {
                vkey = this.getLevelKey(i, levelIdx, key);
                rets.push(parseFloat(Data.getInstance().get(vkey, sources)));
            }
        }

        return rets;
    }

    // 获取到对应的key串，方便取值；
    private getLevelKey(labelIdx, levelIdx, key = "") {
        const keys = key.split(POINT);
        const idxs = [0, levelIdx, labelIdx];
        let idx = 0;
        const len = keys.length;

        for (let i = 0; i < len; i++) {
            keys.splice(idx, 0, idxs[i]);
            idx += 2;
        }

        return keys.join(POINT);
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

