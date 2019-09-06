import {SINGLE_BAR} from "./const";
import {IChartDataFactory} from "./IChartDataFactory";
import {IExtra, IOptions} from "../../ICharts";
import IBarDataFactory from "../input/bar/IBarDataFactory";
import BarDataFactory from "../input/bar/BarDataFactory";

/***
 *  想要单柱状图， 由于单柱状图比较简单；暂时不需要提出来；
 */
export default class SingleFactory implements IChartDataFactory {
    after(extra: IExtra, options) {
        return void 0;
    }

    getSeries(extra: IExtra, options: IOptions): any[] {
        const dataFactory: IBarDataFactory = this.getBarDataFactory(options);
        return dataFactory.getSeries(extra, options);
    }

    getSymbol(): string {
        return SINGLE_BAR;
    }

    handleLabels(extra: IExtra, options: IOptions) {
        const dataFactory: IBarDataFactory = this.getBarDataFactory(options);
        dataFactory.handleLabels(extra, options);
    }

    // no need;
    handleLegends(extra: IExtra, options: IOptions) {
        return void 0;
    }

    handleSerieData(extra: IExtra, options: IOptions): any[] {
        const dataFactory: IBarDataFactory = this.getBarDataFactory(options);
        const values = dataFactory.getSerieData(extra, options);

        return values;
    }

    handleSource(options: IOptions): any[] {
        return this.getBarDataFactory(options).handleSource(options);
    }

    private getBarDataFactory(options): IBarDataFactory {
        return BarDataFactory.getInstance().getDataFactory(options);
    }
}
