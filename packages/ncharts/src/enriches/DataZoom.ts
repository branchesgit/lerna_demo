// import { IEnrich, IMode, IOptions } from "@/ICharts";
// import { IEnrichSerie } from "@/enriches/IEnrichSerie";
// import ModeFactory from "@/factories/mode/ModeFactory";
// import Data from "@/util/Data";
// import Type from "@/util/Type";
// import {ENRICH_DATAZOOM} from "@/enriches/const";

import {IEnrichSerie} from "./IEnrichSerie";
import {ENRICH_DATAZOOM} from "./const";
import {IEnrich, IMode, IOptions} from "../ICharts";
import ModeFactory from "../factories/mode/ModeFactory";
import Data from "../util/Data";
import Type from "../util/Type";

export const DEFAULT_CHART_WIDTH = 60;

export default class DataZoom implements IEnrichSerie {

    getEnrichSymbol(): string {
        return ENRICH_DATAZOOM;
    }

    handleEnrich(enrich: IEnrich, series, options: IOptions) {
        const elem = options.elem;

        // 默认的都进行 datazoom 处理；
        if (enrich.data === false) {
            return;
        }
        // 获取category轴数据
        const mode: IMode = ModeFactory.getInstance().getMode(options);
        const axises = Data.getInstance().get(`option.${mode.x}`, options);
        const pathprefix = Type.getInstance().isArray(axises) ?
            `option.${mode.x}.${enrich.axisIndex || 0}` :
            `option.${mode.x}`;
        let labels = Data.getInstance().get(`${pathprefix}.data`, options);

        // 如果label每项不是object,获取label的值，存在name中
        if (labels && labels.length && !Type.getInstance().isObject(labels[0])) {
            labels = labels.map(val => ({ name: val }));
        }

        const rotate = Data.getInstance().get(`${pathprefix}.axisLabel.rotate`, options);
        this.handleDataZoom(options, labels, DEFAULT_CHART_WIDTH, elem, "name", rotate);
        const h = this.handleGrid(labels, elem, rotate, "name");

        Data.getInstance().set("option.grid", {
            containLable: true,
            bottom: h + 70
        }, options);
        options.option.series.forEach(item => item.barWidth = "70%");
        if (enrich.after) {
            enrich.after(options);
        }
    }

    handleDataZoom(options, data, objWidth, elem, valueName = "", rotate = null, fontSize = 12, percent = 0.8) {
        const option = options.option;
        // get end&showZoom
        const dataLength = data && data.length || 0;
        const width = elem.clientWidth * percent;

        if (valueName && valueName.length) {
            objWidth = this.getMaxLength(data, valueName, objWidth, fontSize, elem, rotate);
        }

        const rowCount = Math.floor(width / objWidth);
        const length = dataLength;
        const showZoom = rowCount > length ? false : true;
        if (showZoom) {
            const mode: IMode = ModeFactory.getInstance().getMode(options);
            const axises = Data.getInstance().get(`option.${mode.x}`, options);
            const axisIndexs = Type.getInstance().isArray(axises) ? axises.map((s, ind) => ind) : [0];
            // 只有1个轴时用startValue和endValue强控制
            // 这个60%是否必要？
            let end = (rowCount / length) * 100;
            let maxcount = rowCount;
            if (end > 60) {
                end = 60;
                maxcount = Math.min(Math.ceil(length * 0.6), maxcount);
            }
            const endOptions = axisIndexs && axisIndexs.length > 1 ? {
                start: 0,
                end
            } : {
                    startValue: 0,
                    endValue: Math.max(maxcount - 1, 0)
                };
            option.dataZoom = {
                id: "dataZoomX",
                type: "slider",
                filterColor: "rgba(13,13,13,0)",
                [`${mode.x}Index`]: axisIndexs,
                filterMode: "filter",
                ...endOptions,
                borderColor: "#F5F5F5",
                zoomLock: false,
                show: true
            };
            option && option.series && option.series.map(item => item.barWidth = objWidth / 2);
        } else {
            option.dataZoom = { show: false };
        }
    }

    getCssText(cssObj) {
        let str = "";
        Object.keys(cssObj).map(key => {
            str += `${key}:${cssObj[key]};`;
        });
        return str;
    }

    getMaxLength(data, valueName, objWidth, fontSize, elem = null, rotate = null) {
        let max = 0;
        const l = data && data.length;
        let width = objWidth;

        if (!elem) {
            elem = document.documentElement || document.body;
        }
        const node = document.createElement("div");
        node.id = "hide-div";
        elem.append(node);
        node.style.cssText = this.getCssText({
            "display": "inline-block",
            "visibility": "hidden",
            "font-size": fontSize,
            "font-family": "sans-serif"
        });
        if (rotate) {
            const deg = `rotate(${-(rotate || 0)}deg)`;
            node.style.cssText += this.getCssText({
                "transform": deg,
                "-ms-transform": deg,
                "-moz-transform": deg,
                "-webkit-transform": deg,
                "-o-transform": deg
            });
        }

        if (l) {
            data.map(item => {
                let name = typeof (item) === "string" ? item : item && item[valueName];
                name = typeof (name) === "number" ? name + "" : (name || "");
                name.length && (name = name.replace(/\n/g, "<br/>"));
                if (node) {
                    node.innerHTML = name;
                }
                const len = node && node.getBoundingClientRect().width;
                max = Math.max(max, len);
            });
            width = Math.max(objWidth, max);
        }

        node.remove();
        return width;
    }

    handleGrid(data, elem, rotate, valueName = "", fontSize = 12) {
        let max = 0;
        const l = data && data.length;
        const node = document.createElement("div");
        node.id = "hide-grid";
        elem.append(node);
        const deg = `rotate(${-(rotate || 0)}deg)`;

        const css = {
            "display": "inline-block",
            "visibility": "hidden",
            "font-size": fontSize,
            "font-family": "sans-serif",
            "transform": deg,
            "-ms-transform": deg,
            "-moz-transform": deg,
            "-webkit-transform": deg,
            "-o-transform": deg
        };

        node.style.cssText = this.getCssText(css);

        if (l) {
            data.map(item => {
                let name = typeof (item) === "string" ? item : item && item[valueName];
                name = typeof (name) === "number" ? name + "" : (name || "");
                name.length && (name = name.replace(/\n/g, "<br/>"));
                if (node) {
                    node.innerHTML = name;
                }
                const len = node && node.getBoundingClientRect().height;
                max = Math.max(max, len);
            });
        }

        node.remove();
        return max;
    }

}
