
export function smaller(a:number, b:number): number{
    return a < b ? a : b;
}

export function bigger(a:number, b:number): number{
    return a > b ? a : b;
}

export function isNull(a: any): boolean {
    return a == null;
}

export function isNotNull(a: any): boolean {
    return a != null;
}

export function setMaxWidthElements(elements: HTMLElement[], width: number|string){
    elements.filter(isNotNull).forEach((el, i) => el.style.maxWidth = el.style.width = (typeof(width) == "number") ? width + "px" : width);
}

export function deepCopyByJsonSerializer(value: any){
    return JSON.parse(JSON.stringify(value));
}

export function removeUnit(value: string){
    return Number(value.replace(/[^0-9]/g, ''));
}