/**
 * 处理serie实例，根据chart类型得到series处理类
 */
import {IOptions} from "../../ICharts";
import {BAR_TYPE} from "../../config/config";
import BarSerieFactory from "../../bar/BarSerieFactory";

export default class SerieFactory {

    private constructor() {
    }

    private static instance: SerieFactory | null = null;

    static getInstance(): SerieFactory {
        if (!SerieFactory.instance) {
            SerieFactory.instance = new SerieFactory();
        }
        return SerieFactory.instance;
    }

    /**
     * @param serie
     * @param idx
     * @param {any[]} sources
     */
    handelSerie(extra, options: IOptions) {
        const type = extra.type;

        if (type === BAR_TYPE) {
            return BarSerieFactory.getInstance().handleSerie(extra, options);
        }
    }
}
