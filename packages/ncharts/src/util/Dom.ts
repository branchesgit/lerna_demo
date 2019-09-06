/**
 * resize监听辅助
 */
export default class Dom {
    private constructor() {
    }

    /**
     * 先只class
     * @param selector
     */
    static closest(selector, elem) {

        if (!elem) {
            return document.body;
        }

        let parent = elem;
        let clsName;
        let bfind = false;

        while (parent) {
            parent = parent.parentNode;

            if (parent.nodeType === Node.ELEMENT_NODE) {
                clsName = parent.getAttribute("class") || "";

                if (clsName.indexOf(selector) !== -1) {
                    bfind = true;
                    break;
                }
            }
        }

        return bfind ? parent : null;
    }

    static on(type, elem, callback) {
        if (elem.addEventListener) {
            elem.addEventListener(type, callback, false);
        } else if (elem.attachEvent) {
            elem.attachEvent("on" + type, callback, false);
        }
    }
}
