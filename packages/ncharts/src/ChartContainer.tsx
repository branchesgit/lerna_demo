/**
 * nchart入口
 */
import * as React from "react";
import TypeUtil from "hqjlcommon/utils/TypeUtil";
import * as  echarts from "echarts";
import ResizeObserve from "./util/ResizeObserve";
import ChartFactory from "./factories/ChartFactory";
import {IOptions, IOutterOptions} from "./ICharts";
import Data from "./util/Data";
import {NCHART_GRAPH_TYPE} from "./config/config";
import nzyextend from "hqjlcommon/utils/extend";

/**
 * 入口组件接收参数
 * @param width 宽度，支持400|"400px"形式
 * @param height 高度，支持400|"400px"形式，有默认值400
 * @param wrapperSlick 是否被slick包裹，slick有响应延迟，对resize需要额外监听
 * @param theme 自己注册的主题名字
 * @param type 图类型，会根据它获取对应的data factory处理options
 * @param options 数据参数
 */
export interface IChartProps {
    width?: number | string;
    height?: number | string;
    wrapperSlick?: boolean;
    theme?: string;
    type?: NCHART_GRAPH_TYPE;
    options?: IOutterOptions;
}

export default class ChartContainer extends React.Component<IChartProps, any> {
    constructor(props) {
        super(props);

        this.state = {};
        this.elem = null;
        this.resize = this.resize.bind(this);
    }

    elem: HTMLDivElement | null;
    observer;
    charts;

    /**
     * 初始化容器，添加监听，初始渲染
     */
    componentDidMount() {
        const elem = this.elem;
        const props = this.props;

        this.handleStyle(elem, props);
        if (elem) {
            this.charts = echarts.init(elem, props.theme || "themea");
            const events = Data.getInstance().get("options.global.events", props) || [];
            events.map(event => {
                this.charts.on(event.type, event.handle);
            });
            window.addEventListener("resize", this.resize, false);
            this.addResizeObserver();

            this.updateOption(this.props);
        }
    }

    /**
     * slick相关resize监听
     */
    addResizeObserver() {
        if (this.props.wrapperSlick) {
            this.observer = new ResizeObserve().addObserver("slick-track", this.elem, this.resize, this);
        }
    }

    /**
     * 卸载组件，卸载监听
     */
    componentWillUnmount() {
        window.removeEventListener("resize", this.resize);
        new ResizeObserve().removeObserver(this.observer);
    }

    /**
     * 获取options并设置，chart对应factory入口
     * @param props 当前props
     */
    updateOption(props) {
        let options = nzyextend(true, {}, props.options);
        options = {
            ...options,
            elem: this.elem
        };

        const option = ChartFactory.getInstance().getChartFactory(props.type, options);
        const type = Data.getInstance().get('global.chartType', options);

        this.charts.setOption(option, true);
    }

    /**
     * resize函数
     */
    resize() {
        if (this.charts) {
            this.charts.resize();
        }
    }

    /**
     * 更新chart
     * @param newProps 当前props
     */
    componentWillReceiveProps(newProps) {
        this.updateOption(newProps);
    }

    /**
     * 容器处理，读取height和width设置容器大小
     * @param elem 容器div
     * @param props 当前props
     */
    handleStyle(elem, props) {

        let style = elem.getAttribute("style") || "";
        const typeIns = TypeUtil.getInstance();
        const attrs = ["width", "height"];

        attrs.forEach((name, _) => {
            if (props[name]) {
                style += typeIns.type(props[name]) === "number" ?
                    `${name}:${props[name]}px;` : `${name}${props[name]};`;
            }

            if (name === "height" && !props[name]) {
                style += `${name}:400px;`;
            }
        });

        elem.setAttribute("style", style);
    }

    render() {
        return <div className="chart-root" ref={elem => this.elem = elem}/>;
    }
}
