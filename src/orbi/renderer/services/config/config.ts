export default interface Config {
    dataConfigs: DataConfig[];
}

export interface DataConfig {
    dataName: string;
    reader: string;
    writer: string;
    columns: DataColumn[]
}

export interface DataColumn {
    id: string;
    name: string;
    minWidth: number;
    maxWidth: number;
    type: string;
}