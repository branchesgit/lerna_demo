// 常量定义
// enrich symbol

// 图类型定义
export const BAR_TYPE = "bar";

export const LINE_TYPE = "line";

export const BOXPLOT_TYPE = "boxplot";

export type NCHART_GRAPH_TYPE = typeof BAR_TYPE | typeof LINE_TYPE | typeof BOXPLOT_TYPE;

// 数据类型定义
export const DATA_FACTORY_TYPE_SINGLE = "single";

export const DATA_FACTORY_TYPE_MULTI = "multi";

export const DATA_FACTORY_TYPE_MULTI_SHALLOW = "multi_shallow";
export const DATA_FACTORY_TYPE_RECT = "rect_box";

export type NCHART_DATA_TYPE = typeof DATA_FACTORY_TYPE_MULTI |
    typeof DATA_FACTORY_TYPE_SINGLE |
    typeof DATA_FACTORY_TYPE_MULTI_SHALLOW |
    typeof DATA_FACTORY_TYPE_RECT;



