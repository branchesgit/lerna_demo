import {IDataFactory} from "./IDataFactory";
import IndicatorInBean from "./IndicatorInBean";
import {DATATYPE, GLOBAL} from "../../../const";
import Data from "../../../util/Data";
import {INDICATOR_IN_BEAN} from "./const";

export default class RadarDataFactory {
    private constructor() {
    }

    private static instance: RadarDataFactory;

    static getInstance(): RadarDataFactory {
        if (!RadarDataFactory.instance) {
            RadarDataFactory.instance = new RadarDataFactory();
        }

        return RadarDataFactory.instance;
    }

    map: { [key: string]: IDataFactory } = {
        [INDICATOR_IN_BEAN]: new IndicatorInBean(),
    }

    getDataFactory(options) {

        const dataType = Data.getInstance().get([GLOBAL, DATATYPE], options);

        if (dataType in this.map) {
            return this.map[dataType];
        } else {
            throw new Error(`${dataType} factory is not implements`);
        }
    }
}