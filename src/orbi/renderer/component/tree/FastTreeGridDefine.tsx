import * as React from "react";
import {NodeType} from "./FastTreeGridViewData2";

export class FastTreeGridDefine{
    public static readonly table = new class {
        public readonly scrollBarWidth: number = 40; // todo
        public readonly minColWidth = 20;
        public readonly rowNum = 100; // todo 同時表示可能な行数。固定値ではなく親のサイズが変わったときに変更できるのが理想。ただ、それほど性能に影響しないので超えなさそうな値として100を入れておく。
        public readonly colNum = 4;
    };
    public static dataListValueType(){
        return <datalist id="valueType">
            <option value="Number">数値</option>
            <option value="String">文字列</option>
            <option value="Bool">フラグ</option>
            <option value="DateTime">日付</option>
        </datalist>
    }
    public static dataListBool(){
        return <datalist id="bool">
            <option value="false"></option>
            <option value="true"></option>
        </datalist>
    }
    public static dataListDBType(){
        return <datalist id="dbType">
            <optgroup label="数値型（整数型）">
                <option value="tinyint">-128～127</option>
                <option value="utinyint">0～255</option>
                <option value="smallint">-32768～32767</option>
                <option value="usmallint">0～65536</option>
                <option value="mediumint">-8388608～8388607</option>
                <option value="umediumint">0～16777215</option>
                <option value="int">-2147483648～2147483647</option>
                <option value="uint">0～4294967295</option>
                <option value="bigint">-9223372036854775808～9223372036854775807</option>
                <option value="ubigint">0～18446744073709551615</option>
            </optgroup>
            <optgroup label="数値型（浮動小数点型）">
                <option value="float">3.402823466E+38～3.402823466E+38</option>
                <option value="double">3.402823466E+38～3.402823466E+38</option>
            </optgroup>
            <optgroup label="文字列型（テキスト型）">
                <option value="char">固定長文字型(0-255文字)</option>
                <option value="varchar">可変長文字型(0～65535バイト)</option>
                <option value="tinytext">テキスト型(0～255バイト)</option>
                <option value="text">テキスト型(0～65535バイト)</option>
                <option value="mediumtext">テキスト型(0～16777215バイト)</option>
                <option value="longtext">テキスト型(0～4294967295バイト)</option>
            </optgroup>
            <optgroup label="バイナリ型">
                <option value="binary">固定長バイナリ型(0～255文字)</option>
                <option value="varbinary">可変長バイナリ型(0～65535バイト)</option>
            </optgroup>
            <optgroup label="日付型／時刻型">
                <option value="date">日付型(デフォルト: 'YYYY-MM-DD')</option>
                <option value="datetime">日付時刻型(デフォルト: 'YYYY-MM-DD HH:MM:SS')</option>
                <option value="timestamp">日付時刻型(デフォルト: 'YYYY-MM-DD HH:MM:SS')</option>
                <option value="time">時刻型(デフォルト: 'HH:MM:SS')</option>
                <option value="year[4]">日付型（4桁年）(デフォルト: 'YYYY')</option>
                <option value="year[2]">日付型（2桁年）(デフォルト: 'YY')</option>
            </optgroup>
        </datalist>
    }

    public static nodeIcons = new Map<NodeType, string>([
        [NodeType.NodeGroupFixed, "fas fa-coins"],
        [NodeType.NodeGroup, "fas fa-folder"],
        [NodeType.NodeEnum, "fas fa-copy"],
        [NodeType.NodeEntity, "fas fa-copy"],
        //[NodeType.NodeEntity, "fas fa-copyright"],
        [NodeType.NodeUniRefEntity, "far fa-copy"],
        //[NodeType.NodeUniRefEntity, "far fa-copyright"],
        [NodeType.NodeProperty, "far fa-file"],
        [NodeType.NodeEnumValue, "far fa-file"],
    ]);

}
