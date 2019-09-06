/**
 * 数据模板：
 *{
 *    avgScore: 4.5
 *    classID: null
 *    className: "1班 "
 *    indicatorScores: {name: "addd", total: 3}
 *    questionnaireCompletedNumber: 2
 *    questionnaireNotCompletedNumber: 27
 *    questionnaireTotalNumber: 29
 *    roleType: "SubjectTeacher"
 *    subjectID: 8
 *    subjectName: "语文"
 *    subjectShortName: "语"
 *    teacherID: 21344385
 *    teacherName: "老师1"
 * }
 * 传进来的数据格式是这样的： [[],[]]
 * 数据结构放在二维数组里，这样的话每个做为一个雷达图；
 * 取出来的每一项数组，如果长度 > 1的话，那么就是求平均值的过程；
 */
import {IDataFactory, IIndicator} from "./IDataFactory";
import {INDICATOR_IN_BEAN} from "./const";
import {IExtra, IOptions} from "../../../ICharts";
import Data from "../../../util/Data";
import {DATA, INDICATOR, OPTION, RADAR, SERIES} from "../../../const";
import Type from "../../../util/Type";
import Ary from "../../../util/Ary";
import Sources from "../util/Sources";


export default class IndicatorInBean implements IDataFactory {
    getSymbol(): string {
        return INDICATOR_IN_BEAN;
    }

    handleIndicator(extra: IExtra, options: IOptions): IIndicator[] {
        let indicators: IIndicator[] = [];
        const indicatorInfo = Data.getInstance().get([OPTION, RADAR, INDICATOR], options);
        const tins: Type = Type.getInstance();

        if (tins.isArray(indicatorInfo)) {
            indicators = indicatorInfo;

        } else if (tins.isObject(indicatorInfo)) {
            const {sources} = extra;
            const {key, name, max} = indicatorInfo;

            sources.some(s => {
                const list = this.getIndicators(key, s);
                const len = list && list.length || 0;

                if (len) {
                    list.map(v => indicators.push({name: v[name], max: v[max] || 1}));
                }

                return !!len;
            });
        }

        return indicators;
    }

    handleRadarData(extra: IExtra, options: IOptions) {
        const values = Data.getInstance().get([OPTION, SERIES, 0, DATA], options);
        const tins: Type = Type.getInstance();
        const {sources} = extra;

        if (tins.isArray(values)) {
            values.map((val, _) => {
                const source = sources[_];
                const len = source && source.length || 0;
                const {key} = val;

                // 求平均值的过程；
                if (len > 1) {
                    const vals = [];
                    source.map(s => {
                        vals.push(Ary.getInstance().getLastList(key, [s]));
                    });

                    const value = Ary.getInstance().calculateAvg(vals);

                    val.value = value;

                } else {
                    const value = Ary.getInstance().getLastList(key, source);
                    val.value = value;
                }
            })
        }

    }

    handleSource(options: IOptions): any[] {
        return Sources.getInstance().handleSource(options);
    }

    private getIndicators(key, sources) {
        const tins: Type = Type.getInstance();
        let target;

        if (tins.isArray(sources)) {
            sources.some(s => {
                if (s[key]) {
                    if (tins.isArray(s[key])) {
                        if (s[key].length) {
                            target = s;
                            return true;
                        }
                    }
                }

                return false;
            });

        } else {
            target = sources;
        }

        return target[key];
    }
}