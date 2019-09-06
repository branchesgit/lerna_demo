/**
 * 提供策略模式；
 * 根据options.global.dataType获取数据处理类
 */

import {IOptions} from "../../../ICharts";
import IdenticalLevel from "./IdenticalLevel";
import Single from "./Single";
import GroupInLevels from "./GroupInLevels";
import IBarDataFactory from "./IBarDataFactory";
import GroupInBean from "./GroupInBean";
import Data from "../../../util/Data";

export default class BarDataFactory {

    private constructor() {
    }

    private static instance: BarDataFactory | null = null;

    static getInstance(): BarDataFactory {
        if (!BarDataFactory.instance) {
            BarDataFactory.instance = new BarDataFactory();
        }
        return BarDataFactory.instance;
    }

    factories = [
        new GroupInBean(),
        new GroupInLevels(),
        new IdenticalLevel(),
        new Single(),
    ];

    /**
     * 遍历factory列表找到和dataType相同symbol的factory并返回
     * @param options 用户配置options
     */
    getDataFactory(options: IOptions) {
        const dataType = Data.getInstance().get("global.dataType", options);
        const dataFactory: IBarDataFactory | undefined =
            this.factories.find(factory => factory.getSymbol() === dataType);

        if (!dataFactory) {
            throw new Error(`${dataType} is not implements, please concat us~`);
        }

        return dataFactory;
    }
}
