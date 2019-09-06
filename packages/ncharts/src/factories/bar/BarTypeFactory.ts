import {IChartDataFactory} from "./IChartDataFactory";
import StackFactory from "../../factories/bar/StackFactory";
import {IOptions} from "../../ICharts";
import Data from "../../util/Data";
import {CHARTTYPE, GLOBAL, POINT} from "../../const";
import SingleFactory from "../../factories/bar/SingleFactory";
import RectFactory from "../../factories/bar/RectFactory";

export default class BarTypeFactory {
    private constructor() {
    }

    private static instance: BarTypeFactory | null = null;

    static getInstance(): BarTypeFactory {
        if (!BarTypeFactory.instance) {
            BarTypeFactory.instance = new BarTypeFactory();
        }

        return BarTypeFactory.instance;
    }

    factories: IChartDataFactory[] = [
        new RectFactory(),
        new SingleFactory(),
        new StackFactory(),
    ];

    getBarTypeFactory(options: IOptions): IChartDataFactory {
        const barType: string = Data.getInstance().get([GLOBAL, CHARTTYPE].join(POINT), options);
        const barFactory: IChartDataFactory | undefined = this.factories.find(f => f.getSymbol() === barType);

        if (!barFactory) {
            throw new Error("bar type is not implement:" + barType);
        }

        return barFactory;
    }
}
