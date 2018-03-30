export default interface Config{
    dataConfigs: DataConfig[];
}

interface DataConfig {
    dataName: string;
    reader: string;
    writer: string;
    columns: DataColumn[]
}
interface DataColumn {
    id: string;
    name: string;
    minWidth: number;
    maxWidth: number;
}