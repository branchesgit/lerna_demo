/**
 * label处理类，目前只有文字切割处理
 */
export default class LabelHandle {
    private constructor() {
    }

    private static instance: LabelHandle | null = null;

    static getInstance(): LabelHandle {
        if (!LabelHandle.instance) {
            LabelHandle.instance = new LabelHandle();
        }

        return LabelHandle.instance;
    }

    /**
     * 文本换行切割，默认初始文本内部没有换行
     * @param name 文本
     */
    cutName(name, maxLength?) {
        maxLength = maxLength || 18;
        const newName = name || "";
        let newStr = "";
        let resStr = "";

        for (let i = 0; i < newName.length; i++) {
            newStr += newName[i].replace(/[^\x00-\xff]/g, "aa");
            resStr += newName[i];
            if (newStr.length >= maxLength) {
                resStr += "\n";
                newStr = "";
            }
        }

        return resStr;
    }

}
