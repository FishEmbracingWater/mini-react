import { createFiber } from "./ReactFiber";
import { isStringOrNumber, Placement, Update } from "./utils";
/**存储删除节点到deletions中，在commit阶段删除 */
function deleteChild(returnFiber, childToDelete) {
    const deletions = returnFiber.deletions;
    if (deletions) {
        returnFiber.deletions.push(childToDelete);
    } else {
        returnFiber.deletions = [childToDelete];
    }
}

function deleteRemainChildren(returnFiber, currentFirstChild) {
    let childToDelete = currentFirstChild;
    while (childToDelete) {
        deleteChild(returnFiber, childToDelete);
        childToDelete = childToDelete.sibling;
    }
}

/*对于初次渲染、只是记录下标
 *更新，检查节点是否移动
 */
function placeChild(
    newFiber,
    lastPlaceIndex,
    newIndex,
    shouldTrackSideEffects
) {
    newFiber.index = newIndex;
    if (!shouldTrackSideEffects) {
        //初次渲染
        return lastPlaceIndex;
    }

    //父节点更新，子节点是初次渲染还是更新
    const current = newFiber.alternate;
    if (current) {
        //子节点是更新
        const oldIndex = current.index;
        if (oldIndex < lastPlaceIndex) {
            //move
            newFiber.flags |= Placement;
            return lastPlaceIndex;
        } else {
            return oldIndex;
        }
    } else {
        //子节点是初次渲染
        newFiber.flags |= Placement;
        return lastPlaceIndex;
    }
}

function mapRemainingChildren(currentFirstChild) {
    const existingChildren = new Map();

    let existingChild = currentFirstChild;
    while (existingChild) {
        // key: value
        // key||index: fiber
        existingChildren.set(
            existingChild.key || existingChild.index,
            existingChild
        );
        existingChild = existingChild.sibling;
    }

    return existingChildren;
}

/**遍历更新子节点 协调（diff）
 * @param returnFiber 父节点
 */
export function reconcileChildren(returnFiber, children) {
    if (isStringOrNumber(children)) return;
    const newChildren = Array.isArray(children) ? children : [children];
    let oldFiber = returnFiber.alternate?.child; //oldfiber的头节点
    //下一个oldFider | 暂时缓存oldFiber
    let nextOldFiber = null;
    //用于判断是初次渲染还是更新,通过父节点的老节点来判断
    let shouldTrackSideEffects = !!returnFiber.alternate;
    let previousNewFiber = null; //上一次fiber
    let newIndex = 0;
    //上一次dom节点插入的最远位置
    let lastPlaceIndex = 0;
    //遍历新节点
    // *1.从左往右遍历，比较新老节点，如果节点可以复用，继续往右，否则就停止
    for (; oldFiber && newIndex < newChildren.length; newIndex++) {
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

        const same = sameNode(newChild, oldFiber);
        if (!same) {
            if (oldFiber === null) {
                oldFiber = nextOldFiber;
            }
            break;
        }
        const newFiber = createFiber(newChild, returnFiber);
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
            previousNewFiber.sibling = newFiber;
        }

        previousNewFiber = newFiber;
        oldFiber = nextOldFiber;
    }

    // *2.新节点没了，老节点还有，删除老节点
    //如果新节点遍历完了，但是（多个）老节点还有，（多个）老节点要被删除
    if (newIndex === newChildren.length) {
        deleteRemainChildren(returnFiber, oldFiber);
        return;
    }

    // *3.初次渲染
    // 1)初次渲染
    // 2)老节点没了，新节点还有
    if (!oldFiber) {
        for (; newIndex < newChildren.length; newIndex++) {
            const newChild = newChildren[newIndex];
            if (newChild === null) continue;
            const newFiber = createFiber(newChild, returnFiber);

            lastPlaceIndex = placeChild(
                newFiber,
                lastPlaceIndex,
                newIndex,
                shouldTrackSideEffects
            );

            if (previousNewFiber === null) {
                //为null时表示头结点
                returnFiber.child = newFiber;
            } else {
                previousNewFiber.sibling = newFiber;
            }

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
        const newFiber = createFiber(newChild, returnFiber);
        //oldFiber
        const matchedFiber = existingChildren.get(
            newFiber.key || newFiber.index
        );
        if (matchedFiber) {
            //节点复用
            Object.assign(newFiber, {
                stateNode: matchedFiber.stateNode,
                alternate: matchedFiber,
                flags: Update,
            });

            existingChildren.delete(newFiber.key || newFiber.index);
        }

        lastPlaceIndex = placeChild(
            newFiber,
            lastPlaceIndex,
            newIndex,
            shouldTrackSideEffects
        );
        if (previousNewFiber == null) {
            returnFiber.child = newFiber;
        } else {
            previousNewFiber.sibling = newFiber;
        }

        previousNewFiber = newFiber;
    }

    // *5 old的哈希表中还有值，遍历哈希表删除所有old
    if (shouldTrackSideEffects) {
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
