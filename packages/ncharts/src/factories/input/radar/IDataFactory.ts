import {IExtra, IOptions} from "../../../ICharts";

export interface IDataFactory {

    handleIndicator(extra: IExtra, options: IOptions): IIndicator[];

    handleRadarData(extra: IExtra, options: IOptions);

    handleSource(options: IOptions): any[];

    getSymbol(): string;
}

export interface IIndicator {
    name: string;
    max: number;
}
