import {GLOBAL, SOURCE} from "../../../const";
import {IOptions} from "../../../ICharts";
import Data from "../../../util/Data";
import Type from "../../../util/Type";

export default class Sources {
    private constructor() {
    }

    private static instance: Sources;

    static getInstance(): Sources {
        if (!Sources.instance) {
            Sources.instance = new Sources();
        }

        return Sources.instance;
    }

    handleSource(options: IOptions): any[] {
        let source = Data.getInstance().get([GLOBAL, SOURCE], options);
        const typeIns = Type.getInstance();

        source = typeIns.isFunction(source) ? source() :
            typeIns.isArray(source) ? source :
                source.key ? Data.getInstance().get(source.key, source.data) : source.data;

        return typeIns.isArray(source) ? source : [source];
    }

}