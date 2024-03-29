import { createFiber } from "./ReactFiber";
import { isStringOrNumber, Placement, Update } from "./utils";
/**存储删除节点到deletions中，在commit阶段删除 */
function deleteChild(returnFiber, childToDelete) {
    //这里的删除，只是标记一下，将要删除的fiber对象放入到一个数组里
    const deletions = returnFiber.deletions;
    if (deletions) {
        //如果有这个数组，直接push
        returnFiber.deletions.push(childToDelete);
    } else {
        //第一次没有数组，初始化数组，将本次要删除的节点放入数组
        returnFiber.deletions = [childToDelete];
    }
}

/**删除剩余的子节点
 * @param {*} returnFiber 父 fiber
 * @param {*} currentFirstChild 当前的第一个要删除的子节点
 */
function deleteRemainChildren(returnFiber, currentFirstChild) {
    let childToDelete = currentFirstChild;
    while (childToDelete) {
        deleteChild(returnFiber, childToDelete);
        childToDelete = childToDelete.sibling;
    }
}

/** 
*对于初次渲染、只是记录下标
 *更新，检查节点是否移动
 * @param {*} newFiber 上面刚刚创建的新的fiber 对象
 * @param {*} lastPlaceIndex 上一次插入的最远位置, 也就是上一次插入的最远位置，初始值为0
 * @param {*} newIndex 当前节点的下标，初始值为0
 * @param {*} shouldTrackSideEffects 用于判断 returnFiber 是初次渲染还是更新
 */
function placeChild(
    newFiber,
    lastPlaceIndex,
    newIndex,
    shouldTrackSideEffects
) {
    //更新fiber对象上的index
    //fiber 对象上的index,用来记录节点在当前层级下的位置
    newFiber.index = newIndex;
    if (!shouldTrackSideEffects) {
        //进入此if，说明是初次渲染,那么不需要记录节点的位置
        return lastPlaceIndex;
    }
    //首先拿到旧的fiber节点
    const current = newFiber.alternate;
    if (current) {
        //子节点是更新
        const oldIndex = current.index;
        if (oldIndex < lastPlaceIndex) {
            //说明点前节点是需要移动的
            newFiber.flags |= Placement;
            return lastPlaceIndex;
        } else {
            //进入此分支，说明oldIndex应该是最新的lastPlaceIndex
            return oldIndex;
        }
    } else {
        //子节点是初次渲染
        newFiber.flags |= Placement;
        return lastPlaceIndex;
    }
}

/**
 * 将旧的子节点构建到一个map 的结构里
 * @param {*} currentFirstChild 
 */
function mapRemainingChildren(currentFirstChild) {
    //首先是创建一个map
    const existingChildren = new Map();

    let existingChild = currentFirstChild;
    while (existingChild) {
        // key: value
        // key||index: fiber
        existingChildren.set(
            existingChild.key || existingChild.index,
            existingChild
        );
        //切换到下一个兄弟节点 
        existingChild = existingChild.sibling;
    }

    return existingChildren;
}

/**
 *该方法是用来协调子节点的，这里涉及到diff算法
 * @param returnFiber 因为是处理子节点的，因此传入的fiber会成为父节点
 * @param children 子节点的vnode
 */
export function reconcileChildren(returnFiber, children) {
    //如果children是字符串或者数字，那么说明这是一个文本节点
    //文本节点在 updateNode 中已经处理过了，这里不需要再处理
    if (isStringOrNumber(children)) return;
    //准备工作
    //如果只有一个子节点，那么children是一个vnode对象
    //如果有多个子节点，那么children是一个vnode数组
    //所以这一步是将children统一转换成数组
    const newChildren = Array.isArray(children) ? children : [children];
    let previousNewFiber = null; //上一次fiber
    let oldFiber = returnFiber.alternate?.child; //oldfiber的头节点
    let newIndex = 0;//记录children 数组的索引(下标)
    let lastPlaceIndex = 0;  //上一次dom节点插入的最远位置

    //下一个oldFider | 暂时缓存oldFiber
    let nextOldFiber = null;
    //用于判断是初次渲染还是更新,通过父节点的老节点来判断
    //true 代表是更新，false 代表是初次渲染
    let shouldTrackSideEffects = !!returnFiber.alternate;//是否需要追踪副作用

    //第一轮遍历，尝试复用节点
    // *1.从左往右遍历，比较新老节点，如果节点可以复用，继续往右，否则就停止
    for (; oldFiber && newIndex < newChildren.length; newIndex++) {
        //第一次不会进入这里，因为一开始的oldFiber是null
        //首先拿到当前的vnode
        const newChild = newChildren[newIndex];

        if (newChild == null) {
            continue;
        }

        if (oldFiber.index > newIndex) {
            //当老节点的下标大于新节点的下标时，证明新节点在老节点的前面，所以要移动
            nextOldFiber = oldFiber;
            oldFiber = null;
        } else {
            nextOldFiber = oldFiber.sibling; //存储老节点的下一个节点
        }
        //判断是否能复用
        const same = sameNode(newChild, oldFiber);
        if (!same) {
            //不能复用，跳出循环
            if (oldFiber === null) {
                //将oldFiber原来的值还原，方便后面使用
                oldFiber = nextOldFiber;
            }
            break;
        }
        //如果能走到这里，说明能复用
        const newFiber = createFiber(newChild, returnFiber);
        //复用旧fiber上的信息，创建一个js成本不高，主要是复用dom
        Object.assign(newFiber, {
            stateNode: oldFiber.stateNode,
            alternate: oldFiber,
            flags: Update,
        });
        //节点更新
        lastPlaceIndex = placeChild(
            newFiber,
            lastPlaceIndex,
            newIndex,
            shouldTrackSideEffects
        );

        if (previousNewFiber == null) {
            //证明是头fiber
            returnFiber.child = newFiber;
        } else {
            //说明不是父fiber 的第一个子节点
            previousNewFiber.sibling = newFiber;
        }

        previousNewFiber = newFiber;
        //存储下一个旧节点
        oldFiber = nextOldFiber;
    }

    // *2.新节点遍历没了，老节点还有，删除老节点
    //从上面的for循环中退出，有以下2种情况
    // 1. oldFiber 为 null ，说明是初次渲染
    // 2. newIndex === newChildren.length ，说明是更新
    //如果新节点遍历完了，但是（多个）老节点还有，（多个）老节点要被删除
    if (newIndex === newChildren.length) {
        //如果还剩余有旧的fiber节点，那么就要删除
        deleteRemainChildren(returnFiber, oldFiber);
        return;
    }

    // *3.初次渲染
    // 1)初次渲染
    // 2)老节点没了，新节点还有
    if (!oldFiber) {
        //说明是初次渲染
        //需要将newChildren 数组中的每一个元素都生成一个fiber 对象
        //然后将这些fiber 对象串联起来
        for (; newIndex < newChildren.length; newIndex++) {
            const newChild = newChildren[newIndex];
            //如果新节点是null，不做处理直接跳过
            if (newChild === null || newChild === undefined) continue;
            // 下一步根据 vnode 生产新的fiber对象
            const newFiber = createFiber(newChild, returnFiber);
            //接下来更新 lastPlaceIndex
            lastPlaceIndex = placeChild(
                newFiber,
                lastPlaceIndex,
                newIndex,
                shouldTrackSideEffects
            );
            //接下来要将新生成的fiber 加入到fiber 链表里面去
            if (previousNewFiber === null) {
                //说明是第一个子节点
                returnFiber.child = newFiber;
            } else {
                //进入此分支,说明当前生成的fiber节点并非父fiber 的第一个子节点
                previousNewFiber.sibling = newFiber;
            }
            //将previousNewFiber设置为newFiber 
            //从而将当前fiber更新为上一个fiber
            previousNewFiber = newFiber;
        }
    }

    // *4.新老节点都还有 vue使用最长递增子序列
    // !4.1 把剩下的old单链表构建哈希表
    const existingChildren = mapRemainingChildren(oldFiber);
    // !4.2 遍历新节点，通过新节点的key去哈希表中查找节点，找到就复用节点，并且删除哈希表中对应的节点
    for (; newIndex < newChildren.length; newIndex++) {
        const newChild = newChildren[newIndex];
        if (newChild == null) {
            continue;
        }
        //根据新节点的vnode 创建新的fiber 对象
        const newFiber = createFiber(newChild, returnFiber);
        //接下来需要去哈希表里寻找是否有可以复用的节点
        const matchedFiber = existingChildren.get(
            newFiber.key || newFiber.index
        );
        //这里有两种情况
        //可能从哈希表中找到了节点，也可能没找到
        if (matchedFiber) {
            //节点复用
            Object.assign(newFiber, {
                stateNode: matchedFiber.stateNode,
                alternate: matchedFiber,
                flags: Update,
            });
            //删除哈希表中的旧fiber
            existingChildren.delete(newFiber.key || newFiber.index);
        }

        lastPlaceIndex = placeChild(
            newFiber,
            lastPlaceIndex,
            newIndex,
            shouldTrackSideEffects
        );
        //形成链表
        if (previousNewFiber == null) {
            returnFiber.child = newFiber;
        } else {
            previousNewFiber.sibling = newFiber;
        }

        previousNewFiber = newFiber;
    }

    // *5 old的哈希表中还有值，遍历哈希表删除所有old
    if (shouldTrackSideEffects) {
        //如果是更新阶段
        existingChildren.forEach((child) => deleteChild(returnFiber, child));
    }
}

/**节点复用的条件  1.同一层级下 2.同一类型 3.key相同 */
function sameNode(oldFiber, newChild) {
    return (
        oldFiber &&
        newChild &&
        oldFiber.type === newChild.type &&
        oldFiber.key === newChild.key
    );
}
