import Ary from "../../../util/Ary";

export default class Merge {
    private constructor() {
    }

    private static instance: Merge;

    static getInstance(): Merge {
        if (!Merge.instance) {
            Merge.instance = new Merge();
        }

        return Merge.instance;
    }

    // 将名字合并；
    mergeNames(key, sources, extra) {
        const len = sources && sources.length || 0;
        const names = [];

        if (len > 1) {
            const ns = [];

            for (let i = 0; i < len; i++) {
                const target = sources[i];
                ns.push(Ary.getInstance().getLastList(key, [target]));
            }

            const vlen = ns[0].length;

            for (let j = 0; j < vlen; j++) {
                for (let i = 0; i < len; i++) {
                    names.push(ns[i][j]);
                }
            }
        }

        return names;
    }

    mergeValues(key, sources, extra) {
        return this.mergeNames(key, sources, extra);
    }

    /**
     * @param vs 将二位数组合并成一维数组；
     */
    mergeDimensions(vs, sourceInfo = {}) {
        const values = [];

        if (vs && vs.length) {
            const vlen = vs[0].length;
            const llen = vs.length;
            const split = sourceInfo["split"];

            for (let i = 0; i < vlen; i++) {
                for (let j = 0; j < llen; j++) {
                    values.push(vs[j][i]);
                }

                if (split) {
                    if (i < (vlen - 1)) {
                        values.push("");
                    }
                }
            }
        }

        return values;
    }

    removeAndUpdateIndex(values) {
        (values || []).map((vs, _) => {
            vs.pop();
            vs.push(_)
        });
    }
}
