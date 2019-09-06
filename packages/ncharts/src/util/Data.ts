/**
 * 数据辅助处理类，主要为设值取值功能
 */
import Type from "./Type";
import {IGlobal, ISourceNode, ISourceConfig} from "../ICharts";
import Ary from "./Ary";

export default class Data {

    private constructor() {
    }

    private static instance: Data | null = null;

    static getInstance(): Data {
        if (!Data.instance) {
            Data.instance = new Data();
        }

        return Data.instance;
    }

    /**
     *  append value to rootObj with key,
     *  key likes this: a.b.c;
     * @param {string} key 设值路径
     * @param value 值
     * @param rootObj 目标对象
     */
    set(key: string | any[], value: any, rootObj: any) {
        const keys: string[] = typeof key === "string" ? key.split(".") : key;
        let data = rootObj;
        let i = 0;

        while (i < (keys.length - 1)) {
            data = data[keys[i]] || (data[keys[i]] = {});
            i++;
        }

        data[keys[i]] = value;
    }

    /**
     * 从object中取值
     * @param key 取值路径
     * @param rootObj 目标对象
     */
    get(key: string | any[], rootObj) {
        const keys: string[] = typeof key === "string" ? key.split(".") : key;
        let data = rootObj;
        let i = 0;

        while (i < keys.length) {
            data = data[keys[i++]];

            if (data === undefined || data === null) {
                break;
            }
        }

        return data;
    }

    isEmptyObj(obj) {
        var name;

        if (obj) {
            for (name in obj) {
                break;
            }
        }

        return !!name;
    }

    /**
     * 从sources中按配置取值
     * @param source 取值配置
     * @param sources 源数组，可以没有
     */
    getSources(source: (() => any) | ISourceConfig, sourceArr: any[] | null = null) {
        let values;

        // 只有一个参数的情况下；
        if (!sourceArr) {

            // 非数组的情况，需要进一步处理
            if (!Type.getInstance().isArray(source)) {
                if (Type.getInstance().isObject(source)) {
                    const {data, key} = source as ISourceConfig;

                    if (Type.getInstance().isObject(data)) {
                        values = data && data[key || ""] || [];

                    } else if (Type.getInstance().isArray(data)) {
                        values = Ary.getInstance().get((data || []) as any[], key || "");
                    }
                } else if (Type.getInstance().isFunction(source)) {
                    values = (source as () => any)();
                }
            }

        } else {
            // sourceArr存在
            let nowkey = (source as ISourceConfig).key;
            const keys: ISourceNode[] = (source as ISourceConfig).keys || [];
            // 找到当前的取值字段
            if (keys.length) {
                const idx = keys.findIndex(it => it.value === nowkey);

                if (idx !== -1) {
                    nowkey = keys[idx].dataKey;
                }
            }
            // 从sourceArr中取值
            values = Ary.getInstance().get(sourceArr || [], nowkey || "");
        }

        return values || source;
    }

    /**
     * 获取当前选择value的对应排序字段
     * @param key 当前选择的value
     * @param keys value,sortKey配置数组
     */
    getSortKey(key: string, keys: ISourceNode[]) {
        const idx = keys.findIndex(it => it.value === key);
        return idx !== -1 ? keys[idx].sortKey : "";
    }
}
