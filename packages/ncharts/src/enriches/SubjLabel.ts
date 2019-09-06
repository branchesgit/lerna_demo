import {IEnrich, IMode, IOptions} from "../ICharts";
import ModeFactory from "../factories/mode/ModeFactory";
import Data from "../util/Data";
import nzyextend from "hqjlcommon/utils/extend";
import {ENRICH_SUBJ_LABEL} from "./const";
import {IEnrichSerie} from "./IEnrichSerie";
import {DATA, GLOBAL, POINT, SOURCE, SOURCES} from "../const";
import Ary from "../util/Ary";

export default class SubjLabel implements IEnrichSerie {
    getEnrichSymbol(): string {
        return ENRICH_SUBJ_LABEL;
    }

    handleEnrich(enrich: IEnrich, series, options: IOptions) {
        const mode: IMode = ModeFactory.getInstance().getMode(options);
        let labels = Data.getInstance().get(`option.${mode.x}.data`, options);
        const sourceKey = Data.getInstance().get([DATA, SOURCE].join(POINT), enrich);
        let sources = Ary.getInstance().getLastList([GLOBAL, SOURCES, sourceKey].join(POINT), options);
        sources = Ary.getInstance().isMoreOneDimensional(sources) ? sources[0] : sources;

        labels = labels.map((value, idx) => {
            const subjName = sources[idx][enrich.data.key];

            return `${value}|${subjName}`;
        });

        Data.getInstance().set(`option.${mode.x}.data`, labels, options);

        let xAxis = {
            axisLabel: {
                show: true,
                formatter: names => {
                    const values = names.split("|");
                    const name = values[0];
                    const subjName = values[1];
                    const img = subjName.length > 1 ? "imgLong" : "img";
                    return subjName !== "null" ? `{value|${name}}\n{${img}|${subjName}}` : `{value|${name}}`;
                },

                rich: {
                    value: {
                        align: "center",
                        lineHeight: 25
                    },
                    img: {
                        backgroundColor: "#FF9458",
                        borderRadius: 50,
                        color: "#FFF",
                        height: 20,
                        width: 20,
                        align: "center"
                    },
                    imgLong: {
                        backgroundColor: "#FF9458",
                        borderRadius: 50,
                        color: "#FFF",
                        height: 20,
                        width: 40,
                        align: "center"
                    }
                }
            }
        };

        xAxis = nzyextend(true, options.option[mode.x] || {}, xAxis);
        Data.getInstance().set(`option.${mode.x}`, xAxis, options);
    }
}