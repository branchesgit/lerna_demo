/**
 * 数组辅助处理
 */
import Data from "../util/Data";
import nzyextend from "hqjlcommon/utils/extend";
import {ISorter} from "../ICharts";
import {POINT} from "../const";
import Type from "../util/Type";
// 附加标记序号字段
const INDEX_KEY = "indexKey";
export default class Ary {
    private constructor() {
    }

    private static instance: Ary | null = null;

    static getInstance(): Ary {
        if (!Ary.instance) {
            Ary.instance = new Ary();
        }
        return Ary.instance;
    }

    /**
     * 对数组进行排序
     * ..param arr 原始数组
     * ..param sorter 排序配置
     */
    sort(arr: any[], sorter: ISorter | undefined) {
        let targets = arr;

        if (sorter) {
            const sort = sorter.sort;

            if (sort) {
                targets = nzyextend(true, [], arr);
                // 获取排序字段
                const sortKey = Data.getInstance().getSortKey(sorter.key, sorter.keys || []);
                // 避免低版本chrome同值排序乱序，同值时用序号排序
                targets.map((item, ind) => item[INDEX_KEY] = ind);
                targets.sort((a, b) => {
                    const cursortKey = a[sortKey] === b[sortKey] ? INDEX_KEY : sortKey;
                    if (sort > 0) {
                        return b[cursortKey] - a[cursortKey];
                    } else {
                        return a[cursortKey] - b[cursortKey];
                    }
                });
            }
        }

        return targets;
    }

    /**
     * 从数组中取值
     * ..param arr 原始数组
     * ..param key 需要取的键值
     * ..param suffix 后缀
     */
    get(arr: any[], key: string, suffix: string = "") {
        const targets: any[] = [];
        (arr || []).forEach((it, _) => targets[_] = suffix ? it[key] + " " + suffix : it[key]);
        return targets;
    }

    /**
     * 获取线性数据最后一个key的数组的某个属性的值；
     */
    getLastList(key: string, sources): any[] {
        const rets = [];
        const keys = (key || "").split(POINT);
        let tmp = sources;
        const tins = Type.getInstance();
        key = keys.pop();
        const len = keys.length;

        for (let i = 0; i < len; i++) {
            while (tins.isArray(tmp)) {
                tmp = tmp[0] || {};
            }

            tmp = tmp[keys[i]] || {};
        }

        if (tins.isArray(tmp)) {
            tmp.forEach(v => rets.push(v[key]));
        }

        return rets;
    }

    plus(v, opv, data) {
        const values = data[v] || [];
        let total = 0;
        values.map(d => total += parseFloat(d[opv] || 0));
        return total;
    }

    subtract(v, opv, data) {
        const values = data[v] || [];
        let total = 0;
        values.map((d, _) => {
            if (!_) {
                total += parseFloat(d[opv] || 0)
            } else {
                total -= parseFloat(d[opv] || 0);
            }
        });
        return total;
    }

    // 求平均值；
    calculateAvg(vals) {
        const values = [];

        if (vals && vals.length) {
            const len = vals[0].length;

            for (let i = 0; i < len; i++) {
                let total = 0;

                vals.map(vs => {
                    total += vs[i] || 0;
                });

                values.push(total / len);
            }
        }

        return values;
    }

    // 非一维的话；
    isMoreOneDimensional(ary) {
        let bret = false;
        const tins = Type.getInstance();

        if (tins.isArray(ary)) {
            const len = ary && ary.length || 0;
            const tmp = len ? ary[0] : {};

            bret = tins.isArray(tmp);
        }

        return bret;
    }
}
