import {IExtra, IOptions} from "../../../ICharts";

export default interface IBarDataFactory {
    // 返回需要渲染的series集合；
    getSeries?: (extra: IExtra, options: IOptions) => any[];

    // 处理每个serie的集合；
    getSerieData?: (extra: IExtra, options: IOptions) => any[];

    // xAxis/yAxis lables 显示；
    handleLabels?: (extra: IExtra, options: IOptions) => void;

    // 获取legend
    handleLegends?: (extra: IExtra, options: IOptions) => void;

    // 处理 sources 集合；
    handleSource(options: IOptions): any[];

    // data factory的区分字段
    getSymbol(): string;

}
