export class StopWatch {
}
StopWatch.start = () => StopWatch.t = Date.now();
StopWatch.stop = () => Date.now() - StopWatch.t + "ms";
StopWatch.stopAndLog = () => console.log(Date.now() - StopWatch.t + "ms");
// 親要素のサイズ変化時にresize()を実行したいが、標準でリスナが用意されていないので親のサイズを定期的に監視。
export class ElementResizeChecker {
    constructor() {
        this._width = 0;
        this._height = 0;
    }
    set(el, cb, checkSpanMs = 100) {
        setInterval(() => { if (this.updateIfChanged(el.getBoundingClientRect()))
            cb(el); }, checkSpanMs);
    }
    updateIfChanged(r) {
        if (this._width == r.width && this._height == r.height)
            return false;
        this._width = r.width;
        this._height = r.height;
        return true;
    }
    get height() { return this._height; }
    get width() { return this._width; }
}
export class PrimitiveObservable {
    constructor(_value) {
        this._value = _value;
        this.maxId = 0;
        this.subscriber = {};
        this.batchUpdating = false;
        this.isUpdatedForBatchUpdating = false;
    }
    startBatchUpdate() {
        this.batchUpdating = true;
        this.isUpdatedForBatchUpdating = false;
    }
    endBatchUpdate() {
        this.batchUpdating = false;
        if (this.isUpdatedForBatchUpdating) {
            this.isUpdatedForBatchUpdating = false;
            this.emit();
        }
    }
    abondonBatchUpdate() {
        this.batchUpdating = false;
        this.isUpdatedForBatchUpdating = false;
    }
    subscribe(a) {
        const id = ++this.maxId;
        this.subscriber[id] = a;
        return id;
    }
    unsubscribe(id) {
        delete this.subscriber[id];
    }
    emit() {
        for (let k in this.subscriber) {
            this.subscriber[k](this.value);
        }
    }
    update(value) {
        if (this.value != value) {
            this.value = value;
            this.emit();
        }
    }
    get value() {
        return this._value;
    }
    set value(val) {
        if (this._value == val)
            return;
        this._value = val;
        this.emit();
    }
}
export class ClickHandler {
    constructor() {
        this.clickTimeout = null;
    }
    click(singleClickFn, doubleClickFn) {
        if (this.clickTimeout !== null) {
            doubleClickFn();
            clearTimeout(this.clickTimeout);
            this.clickTimeout = null;
        }
        else {
            singleClickFn();
            this.clickTimeout = window.setTimeout(() => {
                //singleClickFn(); //<-ダブルクリック時にシングルクリック動作をさせないときはここ
                clearTimeout(this.clickTimeout);
                this.clickTimeout = null;
            }, 200);
        }
    }
}
//# sourceMappingURL=Unclassified.js.map