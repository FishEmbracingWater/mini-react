import { updateNode } from "./utils";
import { renderWithHooks } from "./hooks";
import { reconcileChildren } from "./ReactChildFiber";

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
    console.log(wip);
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
