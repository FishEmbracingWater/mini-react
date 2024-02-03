/**
 * 对fiber对象要做的操作进行标记
 */

// ! flags
export const NoFlags = /*                      */ 0b00000000000000000000;
// 新增、插入、移动
export const Placement = /*                    */ 0b0000000000000000000010; // 2
// 节点更新属性
export const Update = /*                       */ 0b0000000000000000000100; // 4
// 删除
export const Deletion = /*                     */ 0b0000000000000000001000; // 8

//*******************************************************************************************

// ! HookFlags
export const HookLayout = /*    */ 0b010;
export const HookPassive = /*   */ 0b100;

//*******************************************************************************************

export function isStr(s) {
    return typeof s === "string";
}

export function isStringOrNumber(s) {
    return typeof s === "string" || typeof s === "number";
}

export function isFn(fn) {
    return typeof fn === "function";
}

export function isArray(arr) {
    return Array.isArray(arr);
}

export function isUndefined(s) {
    return s === undefined;
}

export function isObject(s) {
    return Object.prototype.toString.call(s) === "[object Object]";
}

/**
 * 该方法主要负责更新dom 节点上的属性
 * @param {*} node 真实的dom节点
 * @param {*} prevVal 旧值
 * @param {*} nextVal 新值
 */
export function updateNode(node, prevVal, nextVal) {
    //这里要做的事情就两部分
    //1.对旧值的处理
    //2.对新值的处理

    //步骤一：对旧值的处理
    Object.keys(prevVal)
        .forEach((k) => {
            //拿到的 k 就有不同的情况
            if (k === "children") {
                //判断children是否是字符串
                //如果是字符串，说明是文本节点，需要清空文本节点
                if (isStringOrNumber(prevVal[k])) {
                    node.textContent = "";
                }
            } else if (k.startsWith("on")) {
                //说明绑定的是事件
                //那么就需要将旧值移除事件

                //首先拿到事件名
                const eventName = k.slice(2).toLocaleLowerCase();
                //如果是change时间，那么背后绑定的是input事件
                if (eventName === "change") {
                    eventName = "input";
                }
                //移除事件
                node.removeEventListener(eventName, prevVal[k]);
            } else {
                //进入此分支，说明是普通属性,例如 id className
                //这里需要检查新值中是否有这个属性
                //如果没有，需要将这个属性移除
                if (!(k in nextVal)) {
                    node[k] = "";
                }
            }
        });

    //步骤二：对新值的处理，流程基本和上面的一样，只不过是反着操作
    Object.keys(nextVal)
        .forEach((k) => {
            if (k === "children") {
                // 判断是否是文本节点
                if (isStringOrNumber(nextVal[k])) {
                    node.textContent = nextVal[k] + "";
                }
            } else if (k.startsWith("on")) {
                const eventName = k.slice(2).toLocaleLowerCase();
                if (eventName === "change") {
                    eventName = "input";
                }
                node.addEventListener(eventName, nextVal[k]);
            } else {
                node[k] = nextVal[k];
            }
        });
}

export function areHookInputsEqual(nextDeps, prevDeps) {
    if (prevDeps == null) {
        return false;
    }

    for (let i = 0; i < prevDeps.length && i < nextDeps.length; i++) {
        if (Object.is(nextDeps[i], prevDeps[i])) {
            continue;
        }
        return false;
    }

    return true;
}
