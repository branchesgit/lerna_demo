export const ENRICH_MULTILINE = "multiBarMarkLine";

export const ENRICH_LABEL_CUT = "labelCut";

export const ENRICH_AVGLINE = "avgLine";


export const ENRICH_DATAZOOM = "dataZoom";

export const ENRICH_LEGEND_REDORDER = "legendReorder";

export const ENRICH_REVERSE_SERIES = "reverseSeries";

export const ENRICH_TOOLTIP_NEWLINE = "tooltipNewline";

export const ENRICH_FAKE_SERIE_DATA = "fakeSerieData";

export const ENRICH_TOP_LABEL = "enrichTopLabel";

export const ENRICH_SUBJ_LABEL = "enrichSubjLabel";

export const ENRICH_NORMAL_MUTIL_TOOLTIP = "enrichNormalMutilTooltip";

export const ENRICH_FORMATTER_RADAR_NAME = "enrichFormatterRadarName";

export const ENRICH_NORMAL_RADAR_TOOLTIP = "enrichNormalRadarTooltip";

export type NCHART_ENRICH_KEY = typeof ENRICH_AVGLINE | typeof ENRICH_MULTILINE |
    typeof ENRICH_DATAZOOM | typeof ENRICH_LEGEND_REDORDER | typeof ENRICH_TOOLTIP_NEWLINE |
    typeof ENRICH_REVERSE_SERIES | typeof ENRICH_FAKE_SERIE_DATA | typeof ENRICH_TOP_LABEL |
    typeof ENRICH_SUBJ_LABEL | typeof ENRICH_NORMAL_MUTIL_TOOLTIP | typeof ENRICH_FORMATTER_RADAR_NAME |
    typeof ENRICH_NORMAL_RADAR_TOOLTIP;