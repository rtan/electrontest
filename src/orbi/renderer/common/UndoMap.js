import * as _ from "underscore";
export var UndoMapOp;
(function (UndoMapOp) {
    UndoMapOp[UndoMapOp["Add"] = 0] = "Add";
    UndoMapOp[UndoMapOp["Del"] = 1] = "Del";
    UndoMapOp[UndoMapOp["Mod"] = 2] = "Mod";
})(UndoMapOp || (UndoMapOp = {}));
export class UndoMap extends Map {
    constructor() {
        super();
        this.history = [];
        // undo時に蓄積。redo時にhistory変数に戻すために利用。蓄積した状態で変更を入れた場合はクリアされる。
        // V[0]=更新前の状態  V[1]=更新後の状態(modのみ)
        this.historyForRedo = [];
        this.isUndoEnabled = false;
    }
    clear() {
        return super.clear();
    }
    delete(key) {
        this.addHistory(UndoMapOp.Del, key, [this.get(key)]);
        return super.delete(key);
    }
    get(key) {
        return super.get(key);
    }
    set(key, value) {
        const before = this.get(key);
        before ? this.addHistory(UndoMapOp.Mod, key, [before, value]) : this.addHistory(UndoMapOp.Add, key, [value]);
        return super.set(key, value);
    }
    setCheckpoint() {
        const a = _.last(this.history);
        if (a)
            a.isCheckpoint = true;
    }
    undo() {
        console.log(this.history);
        if (!this.history.length)
            return false;
        // チェックポイントの手前で停止
        while (true) {
            let a = this.history.pop();
            if (!a)
                return true;
            this.historyForRedo.push(a);
            switch (a.Op) {
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
            if (b && b.isCheckpoint) {
                console.log(this.history);
                return true;
            }
        }
    }
    redo() {
        console.log(this.historyForRedo);
        if (!this.historyForRedo.length)
            return false;
        // チェックポイント処理後に停止
        while (true) {
            let a = this.historyForRedo.pop();
            if (!a)
                return true;
            this.history.push(a);
            switch (a.Op) {
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
            if (a.isCheckpoint) {
                console.log(this.historyForRedo);
                return true;
            }
        }
    }
    clearHistory() {
        this.historyForRedo = [];
    }
    addHistory(op, k, v) {
        if (!this.isUndoEnabled)
            return;
        this.historyForRedo = [];
        this.history.push(new UndoMapHistory(op, k, v.map(v => v.deepCopy())));
        console.log(this.history);
    }
}
class UndoMapHistory {
    constructor(Op, key, value, isCheckpoint = false) {
        this.Op = Op;
        this.key = key;
        this.value = value;
        this.isCheckpoint = isCheckpoint;
    }
}
//# sourceMappingURL=UndoMap.js.map