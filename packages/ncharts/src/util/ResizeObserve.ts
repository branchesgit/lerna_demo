/**
 * observe形式resize监听器
 */
import Dom from "./Dom";

declare var window;

export default class ResizeObserve {

    addObserver(selector, elem, callback, viewIns) {
        const Observer = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
        elem = Dom.closest(selector, elem);

        if (!elem) {
            this.log("selector is not found elem~");
        }

        const config = {
            attributes: true,
            attributeFilter: ["style"],
            attributeOldValue: true
        };

        if (Observer) {
            const observer = new Observer(() => {
                const width = getComputedStyle(elem).getPropertyValue("width");

                if (viewIns.width === width) {
                    return;
                }

                viewIns.width = width;
                callback();
            });

            observer.observe(elem, config);
            return observer;

        } else {

            return null;
        }

    }

    removeObserver(observer) {
        if (observer) {
            observer.disconnect();
            observer.takeRecords();
            observer = null;
        }

    }

    log(message) {
        if (window.console && window.console.log) {
            window.console.log(message);
        }
    }
}
