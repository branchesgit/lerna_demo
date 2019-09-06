/**
 * 类型判断辅助类
 */
import TypeUtil from "hqjlcommon/utils/TypeUtil";

export default class Type {
    private constructor() {
    }

    private static instance: Type | null = null;

    static getInstance(): Type {
        if (!Type.instance) {
            Type.instance = new Type();
        }

        return Type.instance;
    }

    isFunction(obj): boolean {
        return this.checkType(obj, "function");
    }

    isObject(obj): boolean {
        return this.checkType(obj, "object");
    }

    isNumerical(obj): boolean {
        return this.checkType(obj, "number");
    }

    isArray(obj): boolean {
        return this.checkType(obj, "array");
    }

    checkType(obj, type: string): boolean {
        return TypeUtil.getInstance().type(obj) === type;
    }
}
