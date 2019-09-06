import { IExtra, IOptions } from "../../ICharts";

/**
 * 定义处理 options 所配置的数据处理接口；
 */
export interface IChartDataFactory {
    // 返回需要渲染的series集合；
    getSeries(extra: IExtra, options: IOptions): any[];

    // 处理每个serie的集合；
    handleSerieData(extra: IExtra, options: IOptions): any[];

    // xAxis/yAxis lables 显示；
    handleLabels(extra: IExtra, options: IOptions);
    // 获取legend
    handleLegends(extra: IExtra, options: IOptions);
    // 预留函数，获取options后的处理
    after(extra: IExtra, options);

    // 处理 sources 集合；
    handleSource(options: IOptions): any[];

    // data factory的区分字段
    getSymbol(): string;
}
