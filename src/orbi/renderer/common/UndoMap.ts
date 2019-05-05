
import * as _ from "underscore";

export enum UndoMapOp { Add, Del, Mod }

export interface IUndoMapValue<V> {
    deepCopy(): V
}

export class UndoMap<K, V extends IUndoMapValue<V>> extends Map<K, V>{

    private history: UndoMapHistory<K, V[]>[] = [];

    // undo時に蓄積。redo時にhistory変数に戻すために利用。蓄積した状態で変更を入れた場合はクリアされる。
    // V[0]=更新前の状態  V[1]=更新後の状態(modのみ)
    private historyForRedo: UndoMapHistory<K, V[]>[] = [];

    public isUndoEnabled = false;

    constructor(){
        super();
    }

    clear(): void {
        return super.clear();
    }
    delete(key: K): boolean {
        this.addHistory(UndoMapOp.Del, key, [this.get(key)!]);
        return super.delete(key);
    }
    get(key: K): V | undefined {
        return super.get(key);
    }
    set(key: K, value: V): this {
        const before = this.get(key);
        before ? this.addHistory(UndoMapOp.Mod, key, [before, value]) : this.addHistory(UndoMapOp.Add, key, [value])
        return super.set(key, value);
    }
    setCheckpoint(){
        const a = _.last(this.history);
        if(a) a.isCheckpoint = true;
    }
    undo(){
        console.log(this.history);
        if( ! this.history.length) return false;
        // チェックポイントの手前で停止
        while(true) {
            let a = this.history.pop();
            if (!a) return true;
            this.historyForRedo.push(a);
            switch(a.Op){
                case UndoMapOp.Add:
                    console.log("undo add");
                    super.delete(a.key);
                    break;
                case UndoMapOp.Mod:
                    console.log("undo mod");
                    super.set(a.key, a.value[0].deepCopy());
                    break;
                case UndoMapOp.Del:
                    console.log("undo del");
                    super.set(a.key, a.value[0].deepCopy());
                    break;
            }
            const b = _.last(this.history);
            if(b && b.isCheckpoint) {
                console.log(this.history);
                return true;
            }
        }
    }
    redo(){
        console.log(this.historyForRedo);
        if( ! this.historyForRedo.length) return false;
        // チェックポイント処理後に停止
        while(true) {
            let a = this.historyForRedo.pop();
            if (!a) return true;
            this.history.push(a);
            switch(a.Op){
                case UndoMapOp.Add:
                    console.log("redo add");
                    super.set(a.key, a.value[0].deepCopy());
                    break;
                case UndoMapOp.Mod:
                    console.log("redo mod");
                    super.set(a.key, a.value[1].deepCopy());
                    break;
                case UndoMapOp.Del:
                    console.log("redo del");
                    super.delete(a.key);
                    break;
            }
            if(a.isCheckpoint) {
                console.log(this.historyForRedo);
                return true;
            }
        }
    }
    clearHistory(){
        this.historyForRedo = [];
    }
    private addHistory(op: UndoMapOp, k: K, v: V[]){
        if( ! this.isUndoEnabled) return;
        this.historyForRedo = [];
        this.history.push(new UndoMapHistory<K, V[]>(op, k, v.map(v => v.deepCopy())));
        console.log(this.history);
    }

}

class UndoMapHistory<K, V> {
    constructor(
        public readonly Op: UndoMapOp,
        public readonly key: K,
        public readonly value: V,
        public isCheckpoint = false
    ){}
}
