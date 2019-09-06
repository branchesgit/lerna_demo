/**
 * options 基础配置；接口定义
 */

import {NCHART_DATA_TYPE, NCHART_GRAPH_TYPE} from "./config/config";
import {NCHART_ENRICH_KEY} from "./enriches/const";
import {HORIZONTAL, VERTICAL} from "./factories/mode/ModeFactory";

/**
 * legend调序处理配置
 * @param type 类型，suffix后置，prefix前置，reverse反转
 * @param inds 需要后置/前置的序号集合，按先后顺序处理
 */
export interface IReorderItem {
    type: "suffix" | "prefix" | "reverse";
    inds?: number[];
}

/**
 * enrich结构定义，不同factory可能各有字段定义
 * @param key enrich factory标识
 * @param reorder legend重新排序，可以传入处理函数或配置数组，配置数组按顺序处理
 * @param maxlen tooltipnewlen的换行长度
 */
export interface IEnrich {
    name?: string;
    key: NCHART_ENRICH_KEY;
    data?: any;
    top?: boolean;
    reorder?: IReorderItem[] | ((legendItem, index) => any);
    maxlen?: number;

    [key: string]: any;
}

/**
 * option global部分接口定义
 * @param source 数据源配置
 * @param sort
 * @param enriches
 * @param series
 * @param events 需要监听的事件
 * @param dataType 数据处理类型
 */
export interface IGSource {
    split?: boolean; // merge 的时候是否需要用 "" 来分割数据，这样有柱状图有间隔，会好看些，达到类似分类的效果；
    merge?: boolean; // 多维度数据的时候需要需要 合并数据；
    data: any;
    key?: string | string[];
    sorter?: ISorter;
    before?: (dataSource, options) => any;
}

export interface IGlobal {
    source: (() => any[]) | any[] | IGSource;
    // sort?: (a, b) => number | string;
    enriches?: IEnrich[];
    series?: any[] | {
        key: string, orderKey?: string,
        suffix?: string, initSelected?: number[], names?: string[]
    } | ((sources) => any[]);
    events?: Array<{ type: string, handle: (...rest) => any }>;
    chartType?: NCHART_DATA_TYPE;  // 图表展示类型；
    dataType?: string;
}

/**
 * 传入option接口定义
 * @param global 自定义的参数部分
 * @param option 基本上是echarts的options
 * @param mode chart的展示方向，有horizontal和vertical2种
 */
export interface IOutterOptions {
    global: IGlobal;
    option: any;
    mode?: typeof HORIZONTAL | typeof VERTICAL;
}

/**
 * 扩展：内部用的option
 * @param elem 在传入option的基础上添加了容器div
 */
export interface IOptions extends IOutterOptions {
    elem?: HTMLElement;
}

/**
 * mode factory返回结构定义
 * @param x category轴
 * @param y value轴
 */
export interface IMode {
    x: string;
    y: string;
}

/**
 * 排序、取值字段配置集合
 * @param  value 选择的值
 * @param sortKey 实际排序字段
 * @param dataKey 实际取值字段
 */
export interface ISourceNode {
    dataKey?: string;
    sortKey?: string;
    value?: string;
}

/**
 * source配置类型
 * @param keys 字段配置数组
 * @param key 当前选择的value
 * @param data 数据源
 */
export interface ISourceConfig {
    keys?: ISourceNode[];
    key?: string;
    data?: object | any[];
}

/**
 * 排序配置
 * @param sort >0正序，<0倒序
 * @param key 当前排序value
 * @param keys 排序字段配置集合,value代表选择的值，sortKey为实际排序字段
 */
export interface ISorter {
    sort?: number;
    key: string;
    keys: ISourceNode[];
}

export interface IAxisLabel {
    key?: string;
    callback?: (sources: any[]) => any[];
}

export interface IChartNode {
    callback?: (...args) => any[] | any[];
    key?: string;
    keys?: ISourceNode[];
    enrich?: (value) => any;
    currie?: boolean; // 是不是柯里化，需要在里面执行；
}

/**
 * 额外传入内容
 * @param serie 当前系列配置
 * @param levelIdx 序号
 * @param sourceIdx
 * @param groupIdx
 * @param dataIndex
 * @param type chart类型
 * @param sources 数据源
 * @param series 总的series数组
 */
export interface IExtra {
    serie?: any;
    levelIdx?: number;
    sourceIdx?: number;
    groupIdx?: number;
    dataIndex?: number;
    type?: NCHART_GRAPH_TYPE;
    sources?: any[];
    series?: any[];
}
