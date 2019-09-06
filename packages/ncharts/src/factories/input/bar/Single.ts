import {IExtra, IMode, IOptions} from "../../../ICharts";
import Data from "../../../util/Data";
import {DATA, GLOBAL, KEY, OPTION, POINT, SERIES, SOURCE} from "../../../const";
import Ary from "../../../util/Ary";
import Type from "../../../util/Type";
import nzyextend from "hqjlcommon/utils/extend";
import IBarDataFactory from "./IBarDataFactory";
import Merge from "../util/Merge";
import ModeFactory from "../../mode/ModeFactory";
import {SINGLE} from "./const";

/***
 *  最简单的数组，默认不合并多维度的数据；
 */
export default class Single implements IBarDataFactory {

    getSerieData(extra: IExtra, options: IOptions): any[] {
        const {sources, dataIndex} = extra;
        const key = Data.getInstance().get([OPTION, SERIES, 0, DATA, KEY], options) || [];
        const len = sources && sources.length || 0;


        if (len <= 1) {
            return Ary.getInstance().getLastList(key, sources);

            // 如果明确指定 merge = true;
        } else if (this.isSourceMerge(options)) {
            return Merge.getInstance().mergeValues(key, sources, extra);

        } else {
            const target = sources[dataIndex];
            return Ary.getInstance().getLastList(key, target);
        }
    }

    getSeries(extra: IExtra, options: IOptions): any[] {
        let series = Data.getInstance().get([OPTION, SERIES], options);

        if (!series || !series.length) {
            throw new Error("option does not config series, it's illegal~");
        }

        // 如果没指定merge的话，那么就需要根据sources长度来展开 series;
        if (!this.isSourceMerge(options)) {
            const {sources} = extra;
            const len = sources && sources.length || 0;

            if (len > 1) {
                series = sources.map((source, _) => {
                    const base = _ < series.length ? series[_] : series[0];

                    return nzyextend(true, {dataIndex: _}, base);
                });
            }
        }


        return series;
    }

    handleLabels(extra: IExtra, options: IOptions) {
        const {sources} = extra;
        const mode: IMode = ModeFactory.getInstance().getMode(options);
        const key = Data.getInstance().get([OPTION, mode.x, DATA, KEY], options);
        const len = sources && sources.length || 0;

        let names = [];
        if (len <= 1) {
            names = Ary.getInstance().getLastList(key, sources);
        } else if (this.isSourceMerge(options)) {
            names = Merge.getInstance().mergeNames(key, sources, extra);
        } else {
            names = Ary.getInstance().getLastList(key, sources);
        }

        Data.getInstance().set([OPTION, mode.x, DATA], names, options);
    }

    // no need to implements;
    handleLegends(extra: IExtra, options: IOptions) {
        return void 0;
    }

    getSymbol(): string {
        return SINGLE;
    }

    handleSource(options: IOptions): any[] {
        let source = Data.getInstance().get([GLOBAL, SOURCE], options);
        const typeIns = Type.getInstance();
        source = typeIns.isFunction(source) ? source() :
            !source.key ? source : Data.getInstance().get(source.key, source.data);
        return source;
    }

    private isSourceMerge(options) {
        const sourceInfo = Data.getInstance().get([GLOBAL, SOURCE], options);
        return sourceInfo.merge || false;
    }

}
