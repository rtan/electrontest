import {emit} from "cluster";
import * as _ from "underscore";
import getPrototypeOf = Reflect.getPrototypeOf;

type  Action<T> = ((t?:T) => void);

export class StopWatch{
    static t: number;
    public static start = () => StopWatch.t = Date.now();
    public static stop = () => Date.now() - StopWatch.t + "ms";
    public static stopAndLog = () => console.log(Date.now() - StopWatch.t + "ms");
}

// 親要素のサイズ変化時にresize()を実行したいが、標準でリスナが用意されていないので親のサイズを定期的に監視。
export class ElementResizeChecker{
    private _width: number = 0;
    private _height: number = 0;

    public set(el: HTMLElement, cb: (el:HTMLElement) => void, checkSpanMs: number = 100){
        setInterval(() => { if(this.updateIfChanged(el.getBoundingClientRect())) cb(el) }, checkSpanMs);
    }

    private updateIfChanged(r: ClientRect){
        if(this._width == r.width && this._height == r.height)
            return false;
        this._width = r.width;
        this._height = r.height;
        return true;
    }

    get height() { return this._height }
    get width() { return this._width }
}

export class PrimitiveObservable<T extends number|string|boolean|void>{
    private maxId = 0;
    private subscriber: {[id: number]: Action<T>} = {};

    private batchUpdating = false;
    private isUpdatedForBatchUpdating = false;

    public startBatchUpdate(){
        this.batchUpdating = true;
        this.isUpdatedForBatchUpdating = false;
    }
    public endBatchUpdate(){
        this.batchUpdating = false;
        if(this.isUpdatedForBatchUpdating) {
            this.isUpdatedForBatchUpdating = false;
            this.emit();
        }
    }
    public abondonBatchUpdate(){
        this.batchUpdating = false;
        this.isUpdatedForBatchUpdating = false;
    }

    public constructor(private _value: T){}

    public subscribe(a: Action<T>): number{
        const id = ++this.maxId;
        this.subscriber[id] = a;
        return id;
    }
    public unsubscribe(id: number){
        delete this.subscriber[id];
    }
    public emit(){
        for (let k in this.subscriber) {
            this.subscriber[k](this.value);
        }
    }
    public update(value:T){
        if(this.value != value) {
            this.value = value;
            this.emit();
        }
    }

    get value(): T{
        return this._value;
    }

    set value(val: T){
        if(this._value == val) return;
        this._value = val;
        this.emit();
    }
}

export class ClickHandler{
    private clickTimeout: number|null = null;
    public click(singleClickFn: ()=>void, doubleClickFn: ()=>void){
        if(this.clickTimeout !== null){
            doubleClickFn();
            clearTimeout(this.clickTimeout);
            this.clickTimeout = null;
        }
        else {
            singleClickFn();
            this.clickTimeout = window.setTimeout(()=>{
                //singleClickFn(); //<-ダブルクリック時にシングルクリック動作をさせないときはここ
                clearTimeout(this.clickTimeout!);
                this.clickTimeout = null;
            }, 200);
        }
    }
}
