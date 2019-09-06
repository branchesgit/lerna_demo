import nzyextend from "hqjlcommon/utils/extend";
import {IEnrichSerie} from "./IEnrichSerie";
import {ENRICH_FAKE_SERIE_DATA} from "./const";
import {IEnrich, IOptions} from "../ICharts";
import Data from "../util/Data";
import {DATA, ENRICHES, GLOBAL, LABEL, NORMAL, ORIGDATA} from "../const";
import Type from "../util/Type";

/**
 *  author: branches.
 *  写这个的目的是由于柱装图，由于存在较小值，导致高度不够，
 *  并且设置最小高度时候，由于因为要连线的原因，导致连线不对；
 *  min:阈值，当value小于这个阈值时，把它的高度拉到min
 */
/**
 *  author: loglu.
 *  keepmax:在保证最小值的情况下，合计值需要保持不变时，所有值需要按比例调整
 *  ignoreValues：不需要调整高度的值，比如0值不显示
 */
export default class FakeSerieData implements IEnrichSerie {
    getEnrichSymbol(): string {
        return ENRICH_FAKE_SERIE_DATA;
    }

    /**
     * @param {IEnrich} enrich
     * @param series
     * @param {IOptions} options
     */
    handleEnrich(enrich: IEnrich, series, options: IOptions) {
        const { min, ignoreValues = [], keepmax } = enrich;
        let bmodify = false;
        if (keepmax) {
            bmodify = this.keepMaxFitValues(series, enrich);
        } else {
            (series || []).map((serie, _) => {
                const values = Data.getInstance().get(DATA, serie) || [];
                const orivalues = nzyextend(true, [], values);
                const tins: Type = Type.getInstance();

                values.map((val, _) => {
                    if (tins.isObject(val)) {
                        if (ignoreValues.indexOf(val.value) < 0 && parseFloat(val.value) < min) {
                            val.value = min;

                            !bmodify && (bmodify = true);
                        }
                    } else {
                        if (ignoreValues.indexOf(val) < 0 && parseFloat(val) < min) {
                            values[_] = min;
                            !bmodify && (bmodify = true);
                        }
                    }
                });

                Data.getInstance().set(DATA, values, serie);
                Data.getInstance().set(ORIGDATA, orivalues, serie);
            });
        }

        // 需要修改 serie label;
        if (bmodify) {
            this.labelFormatter(series);
        }
    }

    /**
     * 保持原总和的情况
     * (sum-n*min)=leftsum;//保证每个最小值的情况，剩余可用sum
     * newvalue = min + Math.max((orivalue-min),0)*(leftsum/totalsum)
     * 把实际多余的realLeftsum比例压缩到leftsum
     */
    keepMaxFitValues(series, enrich) {
        let bmodify = false;
        const valuesArr: any[][] = [];
        let vallen = 0;
        // 取出值
        (series || []).map((serie, serieIndex) => {
            const values = Data.getInstance().get(DATA, serie) || [];
            const orivalues = nzyextend(true, [], values);
            valuesArr.push(values);
            vallen = Math.max(vallen, values.length);
            Data.getInstance().set(ORIGDATA, orivalues, serie);
        });
        // 值处理
        for (let i = 0; i < vallen; i++) {
            const curvals = valuesArr.map(arr => arr && arr[i]);
            const res = this.calcuFitValues(curvals, enrich);
            bmodify = bmodify || res.bmodify;
            (res.values || []).map((val, valIndex) => {
                if (valuesArr[valIndex]) {
                    valuesArr[valIndex][i] = val;
                }
            });
        }
        // 设置处理后的值
        valuesArr.map((arr, arrIndex) => Data.getInstance().set(DATA, arr, series[arrIndex]));
        return bmodify;
    }

    calcuFitValues(values, enrich) {
        const { min, ignoreValues = [] } = enrich;
        let count = 0;
        let realLeftSum = 0;
        let sum = 0;
        // 计算count：实际有高度的个数
        // realLeftSum 实际每项保持最小值的情况下多余的量的总和
        // sum 原始总和
        (values || []).map(val => {
            const tins: Type = Type.getInstance();
            const curval = tins.isObject(val) ? parseFloat(val.value) : parseFloat(val);
            const noIgnore = ignoreValues.indexOf(curval) < 0;
            if (noIgnore) {
                count += 1;
                sum += curval;
                realLeftSum += Math.max(0, curval - min);
            }
        });
        // 每项赋给最小值后可用的多余量(leftsum<=realLeftsum)
        // leftsum<=0意味着原始总和本身不足，此时不做压缩处理
        // percent：每项多余量的压缩比例
        const leftsum = sum - count * min;
        const percent = (leftsum > 0 && realLeftSum > 0) ? leftsum / realLeftSum : 1;
        let bmodify = percent !== 1;
        (values || []).map((val, valindex) => {
            const tins: Type = Type.getInstance();
            if (tins.isObject(val) && ignoreValues.indexOf(val.value) < 0) {
                bmodify = bmodify || (parseFloat(val.value) < min);
                val.value = min + Math.max(val.value - min, 0) * percent;
            } else if (ignoreValues.indexOf(val) < 0) {
                bmodify = bmodify || (parseFloat(val) < min);
                values[valindex] = min + Math.max(val - min, 0) * percent;
            }
        });
        return { values, bmodify };
    }

    private labelFormatter(series) {
        (series || []).map((serie, _) => {
            const orivalues = serie[ORIGDATA] || [];
            const normalInfo = Data.getInstance().get([LABEL, NORMAL], serie);

            if (normalInfo) {
                if (normalInfo.formatter) {
                    normalInfo.formatter = normalInfo.formatter.bind(null, orivalues);
                } else {
                    normalInfo.formatter = params => {
                        const { dataIndex, value } = params;
                        return orivalues[dataIndex] || value;
                    };
                }
            }
        });
    }

    hasFakeEnrich(options: IOptions) {
        const enriches = Data.getInstance().get([GLOBAL, ENRICHES], options);
        const idx = enriches.findIndex(enrich => enrich.key === ENRICH_FAKE_SERIE_DATA);
        return idx !== -1;
    }

    // 获取对应原始的值；
    getOriValue(series, params) {
        const { dataIndex, seriesIndex } = params;
        const orivalues = series[seriesIndex][ORIGDATA];
        return orivalues[dataIndex];
    }
}
