import {
    FunctionComponent,
    HostComponent,
    ClassComponent,
    Fragment,
    HostText,
} from "./ReactWorkTags";
import { isFn, isStr, Placement, isUndefined } from "./utils";

/**
 * 创建fiber
 * @param {*} vnode 当前的vnode节点
 * @param {*} returnFiber 父 Fiber 节点
 * @returns 
 */
export function createFiber(vnode, returnFiber) {
    const fiber = {
        type: vnode.type, //类型 比如div,函数组件则直接为function
        key: vnode.key,
        props: vnode.props, //属性
        //存储当前fiber对象所对应的dom节点， 不同类型组件真实dom节点，stateNode不同，比如原生组件是dom节点，类组件是实例
        stateNode: null,
        //整个fiber 树是以单链表的形式组织的，所以需要 child、sibling、return
        child: null, //第一个子fiber
        sibling: null,
        return: returnFiber,

        flags: Placement, //当前fiber要进行的操作，二进制
        index: null, //记录节点在当前层级下的位置
        alternate: null, //存储旧的fiber对象,用于比较（涉及fiber 的双缓冲机制）
        memorizedState: null, //函数组件存储的第一个hook0
    };

    //实际上fiber 对象上还有一个tag值，用来标记当前fiber 的 type值
    //不同的type值代表不同的组件类型
    const { type } = vnode;
    if (isStr(type)) {
        //为string时是原生标签
        fiber.tag = HostComponent;
    } else if (isFn(type)) {
        //todo 函数组件和类组件都是function
        fiber.tag = type.prototype.isReactComponent
            ? ClassComponent
            : FunctionComponent;
    } else if (isUndefined(type)) {
        //文本节点
        fiber.tag = HostText;
        //文本节点是没有props属性的，手动的给fiber对象添加props属性
        fiber.props = { children: vnode };
    } else {
        fiber.tag = Fragment;
    }

    return fiber;
}
