/**
 * 各类型图series处理类接口定义
 */
import {IExtra, IOptions} from "./ICharts";

export default interface ISerieHandle {
    // serie单个处理
    handleSerie(extra: IExtra, options: IOptions);
}
