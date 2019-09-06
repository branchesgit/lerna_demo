/**
 * 各类型图基础类的接口
 */
import {IOptions} from "./ICharts";

export default interface IFactory {
    // 初始化
    initialize(options: IOptions);
}
