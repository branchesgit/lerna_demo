/**
 * 获取对应的enrich factory处理数据
 */
import AvgMarkLine from "./AvgMarkLine";
import DataZoom from "./DataZoom";
import FormatterRadarName from "./FormatterRadarName";
import FakeSerieData from "./FakeSerieData";
import LabelCut from "./LabelCut";
import LegendReorder from "./LegendReorder";
import MultiBarMarkLine from "./MultiBarMarkLine";
import NormalMultiTooltip from "./NormalMultiTooltip";
import RadarTooltip from "./RadarTooltip";
import RevertSeries from "./RevertSeries";
import ReverseSeries from "./ReverseSeries";
import SubjLabel from "./SubjLabel";
import TooltipNewline from "./TooltipNewline";
import TopLabel from "./TopLabel";
import {IOptions} from "../ICharts";

// import {IOptions} from "@/ICharts";
// import AvgMarkLine from "@/enriches/AvgMarkLine";
// import MultiBarMarkLine from "@/enriches/MultiBarMarkLine";
// import DataZoom from "@/enriches/DataZoom";
// import LegendReorder from "@/enriches/LegendReorder";
// import TooltipNewline from "@/enriches/TooltipNewline";
// import RevertSeries from "@/enriches/RevertSeries";
// import ReverseSeries from "@/enriches/ReverseSeries";
// import FakeSerieData from "@/enriches/FakeSerieData";
// import LabelCut from "@/enriches/LabelCut";
// import FormatterRadarName from "@/enriches/FormatterRadarName";
// import NormalMultiTooltip from "@/enriches/NormalMultiTooltip";
// import RadarTooltip from "@/enriches/RadarTooltip";
// import SubjLabel from "@/enriches/SubjLabel";
// import TopLabel from "@/enriches/TopLabel";

export default class EnrichFactory {

    private constructor() {
    }

    private static instance: EnrichFactory | null = null;

    static getInstance(): EnrichFactory {
        if (!EnrichFactory.instance) {
            EnrichFactory.instance = new EnrichFactory();
        }

        return EnrichFactory.instance;
    }

    enrichHandle = [
        new AvgMarkLine(),
        new DataZoom(),
        new FakeSerieData(),
        new FormatterRadarName(),
        new LabelCut(),
        new LegendReorder(),
        new MultiBarMarkLine(),
        new NormalMultiTooltip(),
        new RadarTooltip(),
        new RevertSeries(),
        new ReverseSeries(),
        new SubjLabel(),
        new TooltipNewline(),
        new TopLabel(),
    ];

    handleEnrich(enrich, series, options: IOptions) {
        const key = enrich.key;
        const idx = this.enrichHandle.findIndex(enrichHandle => enrichHandle.getEnrichSymbol() === key);

        if (idx === -1) {
            throw new Error(`type of ${key} enrich is not implements, please concat us~`);
        }

        return this.enrichHandle[idx].handleEnrich(enrich, series, options);
    }
}
