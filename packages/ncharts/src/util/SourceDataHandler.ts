import { POINT } from "../const";
import Type from "./Type";
import nzyextend from "hqjlcommon/utils/extend";
/**
 * author: loglu
 * 数据补充过程，nchart取系列时会默认从数组第一项里取，取值按顺序取，
 * 为了处理数组可能的缺项造成的系列缺失或者数据错位，提供用指定空值补全数据项的函数
 */
interface IEnrichSourceConfig {
    aryPath: string; // 取数组路径
    idKeys: string[]; // 去重unique字段
    valKeys: string[]; // 数据项字段
    emptyValue?: any; // 补充项的数据值
    sorter?: (a, b) => number; // 补充后的重新排序函数，默认用idKeys[0]排序
}
/**
 * 堆叠图会有数据项不全的问题，需要补充数据并重新排序
 * @param source 数据源
 * @param config 配置项
 */
function enrichSourceData(source, config: IEnrichSourceConfig) {
    // step1.获取series列表，第一个遍历
    const uniqueary = getUniqueSourceAry(source, config);
    // step2.数据补充与重排序，第二个遍历
    setNewSourceData(source, uniqueary, config);
}

/**
 * 根据遍历得到的参考数组补充数据
 * @param source 源数据
 * @param uniqueary 参考数组
 * @param config 配置
 */
function setNewSourceData(source, uniqueary: any[], config: IEnrichSourceConfig) {
    const { aryPath } = config;
    const paths = (aryPath || "").split(POINT);
    if (paths && paths.length) {
        enrichAndResortAryItem(source, paths, uniqueary, config);
    }
}

/**
 * 递归遍历并重新设置数组
 * @param source 源数据
 * @param paths 路径数组
 * @param uniqueary 参考数组
 * @param config 配置
 */
function enrichAndResortAryItem(source, paths, uniqueary: any[], config: IEnrichSourceConfig) {
    const tins = Type.getInstance();
    const curkey = paths.splice(0, 1);
    const pathlen = paths && paths.length || 0;
    const { idKeys = [] } = config;
    // 如果source是数组，则需要遍历它取数据
    // 如果path不是最后一项，则需要取到里面
    const arysource = tins.isArray(source) ? source : [source];
    (arysource || []).map(cursource => {
        if (pathlen > 0) {
            enrichAndResortAryItem(cursource[curkey], paths, uniqueary, config);
        } else {
            // 补充：链接到后面并去重
            let values = cursource[curkey] || [];
            values = values.concat(uniqueary || []);
            values = values.filter((valitem, valindex, arr) =>
                arr.findIndex(arrItem => {
                    let flag = true;
                    idKeys.map(idKey => flag = flag && (arrItem[idKey] === valitem[idKey]));
                    return flag;
                }) === valindex);
            // 重新排序
            values.sort(config.sorter || ((a, b) => a[idKeys[0]] - b[idKeys[0]]));
            cursource[curkey] = values;
        }
    });
}

/**
 * 获取不重复的数组项总和
 * @param source 源数据
 * @param config 配置
 */
function getUniqueSourceAry(source, config: IEnrichSourceConfig) {
    const { aryPath, idKeys = [], emptyValue = "", valKeys } = config;
    const paths = (aryPath || "").split(POINT);
    if (paths && paths.length) {
        let ary: any[] = getTotalAryItems(source, paths);
        ary = ary.filter((aryItem, index, arr) =>
            arr.findIndex(arrItem => {
                let flag = true;
                idKeys.map(idKey => flag = flag && (arrItem[idKey] === aryItem[idKey]));
                return flag;
            }) === index);
        ary = ary.map(aryItem => {
            const newItem = nzyextend(true, {}, aryItem);
            valKeys.map(key => newItem[key] = emptyValue);
            return newItem;
        });
        return ary;
    } else {
        return [];
    }
}

/**
 * 递归获取数组项总和
 * @param source 源数据
 * @param paths 数组路径数组
 */
function getTotalAryItems(source, paths) {
    const tins = Type.getInstance();
    const curkey = paths.splice(0, 1);
    const pathlen = paths && paths.length || 0;
    let ary = [];
    // 如果source是数组，则需要遍历它取数据
    // 如果path不是最后一项，则需要取到里面
    const arysource = tins.isArray(source) ? source : [source];
    (arysource || []).map(cursource => {
        if (pathlen > 0) {
            const values = getTotalAryItems(cursource[curkey], paths);
            ary = ary.concat(values);
        } else {
            const values = cursource[curkey] || [];
            ary = ary.concat(values);
        }
    });
    return ary;
}

export default {
    enrichSourceData
};
