export interface LogoSearchDataSet {
    entries : LogoSearchDataPoint[];
}

export interface LogoSearchDataPoint {
    name : string;
    img : string;
    dom? : HTMLElement;
}