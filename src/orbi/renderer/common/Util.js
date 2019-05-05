export function smaller(a, b) {
    return a < b ? a : b;
}
export function bigger(a, b) {
    return a > b ? a : b;
}
export function isNull(a) {
    return a == null;
}
export function isNotNull(a) {
    return a != null;
}
export function setMaxWidthElements(elements, width) {
    elements.filter(isNotNull).forEach((el, i) => el.style.maxWidth = el.style.width = (typeof (width) == "number") ? width + "px" : width);
}
export function deepCopyByJsonSerializer(value) {
    return JSON.parse(JSON.stringify(value));
}
export function removeUnit(value) {
    return Number(value.replace(/[^0-9]/g, ''));
}
//# sourceMappingURL=Util.js.map