/**
 * 处理图形的显示模式,
 * 暂时比较简单，只区分横向/纵向
 * vertical: x轴category,y轴value
 * horizontal:x轴value，y轴category
 */

export const HORIZONTAL = "horizontal";
export const VERTICAL = "vertical";
export const XAXIS = "xAxis";
export const YAXIS = "yAxis";

export default class ModeFactory {

    private constructor() {
    }

    private static instance: ModeFactory | null = null;

    static getInstance(): ModeFactory {
        if (!ModeFactory.instance) {
            ModeFactory.instance = new ModeFactory();
        }
        return ModeFactory.instance;
    }

    /**
     * 获取value和category对应的轴
     */
    getMode(options) {
        return this.isVerticalMode(options) ? { x: XAXIS, y: YAXIS } : { x: YAXIS, y: XAXIS };
    }

    /**
     * 模式判断,是否horizontal
     * @param options 用户配置
     */
    isHorizontalMode(options): boolean {
        const mode = options.mode;
        return mode && mode === HORIZONTAL;
    }

    /**
     * 模式判断,是否vertical
     * @param options 用户配置
     */
    isVerticalMode(options): boolean {
        const mode = options.mode;
        return !mode || mode !== HORIZONTAL;
    }

}
