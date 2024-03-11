import { updateNode } from "./utils";
import { renderWithHooks } from "./hooks";
import { reconcileChildren } from "./ReactChildFiber";

/**
 * 更新原生标签
 * @param {*} wip 需要处理的fiber节点
 *  */
export function updateHostComponent(wip) {
    if (!wip.stateNode) {
        //进入这里说明是初次渲染，当前fiber 没有真实的dom节点
        wip.stateNode = document.createElement(wip.type); //创建真实dom节点,存到stateNode上
        updateNode(wip.stateNode, {}, wip.props); //更新该节点上的属性
    }

    //到目前为止，当前fiber节点对应的stateNode 已经有值了，也就是真实的dom节点
    //接下来需要处理它的子节点，只是一层子节点的处理
    reconcileChildren(wip, wip.props.children); //更新当前wip的子节点，添加到wip.child上
    //上一步执行完毕后，说明已经处理完所有的子节点vnode，fiber的链表也已经形成
}

/**更新函数组件 */
export function updateFunctionComponent(wip) {
    //在处理fiber之前，先处理hooks
    renderWithHooks(wip);
    const { type, props } = wip;
    //这里从当前wip 上面获取到的type是一个函数
    //那么执行这个函数，获取返回值
    const children = type(props);
    //有了 vnode 节点之后，调用reconcileChildren 处理子节点
    reconcileChildren(wip, children);
}

/**更新类组件 */
export function updateClassComponent(wip) {
    const { type, props } = wip;
    //这里从当前的wip上面获取到的type是一个类
    //实例化这个类
    const instance = new type(props);
    //调用实例的render方法，获取返回值
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
