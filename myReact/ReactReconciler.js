import { isStringOrNumber, Update, updateNode } from "./utils";
import { createFiber } from "./ReactFiber";
import { renderWithHooks } from "./hooks";

/**更新原生标签 */
export function updateHostComponent(wip) {
    if (!wip.stateNode) {
        wip.stateNode = document.createElement(wip.type); //创建真实dom节点,存到stateNode上
        updateNode(wip.stateNode, {}, wip.props); //更新该节点上的属性
    }

    reconcileChildren(wip, wip.props.children); //更新当前wip的子节点，添加到wip.child上
}

/**更新函数组件 */
export function updateFunctionComponent(wip) {
    renderWithHooks(wip);
    const { type, props } = wip;
    const children = type(props);
    reconcileChildren(wip, children);
}

/**更新类组件 */
export function updateClassComponent(wip) {
    const { type, props } = wip;
    const instance = new type(props);
    const children = instance.render();
    reconcileChildren(wip, children);
}

/**更新Fragment */
export function updateFragmentComponent(wip) {
    reconcileChildren(wip, wip.props.children); //Fragment本身没有节点是个空标签，直接更新子节点
}

/**更新文本节点 */
export function updateHostTextComponent(wip) {
    wip.stateNode = document.createTextNode(wip.props.children); //创建文本节点，存到stateNode上
}

/**遍历更新子节点 协调（diff） */
function reconcileChildren(wip, children) {
    if (isStringOrNumber(children)) return;
    const newChildren = Array.isArray(children) ? children : [children];
    let oldFiber = wip.alternate?.child; //oldfiber的头节点
    let previousNewFiber = null;
    for (let i = 0; i < newChildren.length; i++) {
        const newChild = newChildren[i];
        if (newChild === null) continue;
        const newFiber = createFiber(newChild, wip);
        const same = sameNode(newFiber, oldFiber);

        if (same) {
            Object.assign(newFiber, {
                stateNode: oldFiber.stateNode,
                alternate: oldFiber,
                flags: Update,
            });
        }
        if (oldFiber) {
            oldFiber = oldFiber.sibling;
        }

        if (previousNewFiber === null) {
            //为null时表示头结点
            wip.child = newFiber;
        } else {
            previousNewFiber.sibling = newFiber;
        }

        previousNewFiber = newFiber;
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
