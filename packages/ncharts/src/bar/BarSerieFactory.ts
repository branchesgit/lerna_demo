/**
 * bar类型的单个系列(seire)处理类
 */
import ISerieHandle from "../ISerieHandle";
import {IExtra, IOptions} from "../ICharts";
import BarTypeFactory from "../factories/bar/BarTypeFactory";
import Data from "../util/Data";

export default class BarSerieFactory implements ISerieHandle {
    private constructor() {
    }

    private static instance: BarSerieFactory | null = null;

    static getInstance(): BarSerieFactory {
        if (!BarSerieFactory.instance) {
            BarSerieFactory.instance = new BarSerieFactory();
        }

        return BarSerieFactory.instance;
    }

    /**
     * 处理单个系列seire并返回结果
     * @param extra 附加传入信息
     * @param {IOptions} options 用户配置options
     * @returns {any[]}
     */
    handleSerie(extra: IExtra, options: IOptions) {
        this.handleSerieData(extra, options);
        // this.handleItemLabel(extra, options);
        return extra.serie;
    }

    /**
     * data处理
     * @param extra 附加传入信息
     * @param options 用户配置options
     */
    private handleSerieData(extra: IExtra, options: IOptions) {
        const dataFactory = BarTypeFactory.getInstance().getBarTypeFactory(options);
        const values = dataFactory.handleSerieData(extra, options);

        Data.getInstance().set("data", values, extra.serie);
    }

}
