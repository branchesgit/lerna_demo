import { IExtra } from "../ICharts";
import Data from "./Data";
import Type from "./Type";

export default class List {
    private constructor() {
    }

    private static instance: List;

    static getInstance(): List {
        if (!List.instance) {
            List.instance = new List();
        }

        return List.instance;
    }

    /**
     * 获取名字列表(eg.sources[0].label)
     * @param {IExtra} extra
     * @param {any} key
     * @param {any} suffix
     * @returns {any[]}
     */
    getNames(extra: IExtra, { key, suffix }) {
        const keyInfo = this.getNameKey(key);
        const names = this.getTargets(extra.sources || [], keyInfo);
        return names;
    }

    private getNameKey(key: string, sourceIdx = 0, levelIdx = 0) {
        if (typeof key !== "string") {
            return { keys: "", key: "" };
        }

        const keys: string[] = key.split(".");

        if (keys.length < 2) {
            // sourceIdx拼接key
            return {
                keys: [sourceIdx, keys[0]].join("."),
                key: "",
            };
        } else {
            key = keys.pop() || "";

            let i = 0;
            const len = keys.length;
            let idx = 0;
            const idxs = [sourceIdx, levelIdx];

            for (; i < len; i++) {
                keys.splice(idx, 0, idxs[i] + "");
                idx += 2;
            }

            return {
                // a[sourceIdx].b[levelIdx].xxx
                keys: keys.join("."),
                key
            };
        }

    }

    getTargets(sources: any[], { keys, key }) {
        // 按照keys路径取数组
        const arr = Data.getInstance().get(keys, sources);
        const vals: any[] = [];
        // 如果有key，从arr中取该项放进val
        if (arr && arr.length && key) {
            arr.map((item, _: number) => {
                vals[_] = item[key];
            });
        }
        // 有key用val，没有key用arr
        return key ? vals : arr;
    }
}
