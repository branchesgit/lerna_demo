/**
 * 附加功能实现类的接口定义
 */
import { IEnrich, IOptions } from "../ICharts";
import {PLUS, SUBTRACT} from "../const";

export interface IEnrichSerie {
    // 唯一标识
    getEnrichSymbol(): string;
    // 处理
    handleEnrich(enrich: IEnrich, series, options: IOptions);
}

export interface ITooltip {
    mark?: any;
    name?: string;
    value?: string;
    operation?: typeof SUBTRACT | typeof PLUS;
    opv?: string;
}

//
export interface IEnrichNormalMutilTooltip {
    before?: ITooltip[];
    after?: ITooltip[];
    keys?: string[];
}