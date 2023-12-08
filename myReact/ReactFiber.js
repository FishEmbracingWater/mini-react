import {
    FunctionComponent,
    HostComponent,
    ClassComponent,
    Fragment,
    HostText,
} from "./ReactWorkTags";
import { isFn, isStr, Placement, isUndefined } from "./utils";
//创建fiber
export function createFiber(vnode, returnFiber) {
    const fiber = {
        type: vnode.type, //类型 比如div,函数组件则直接为function
        key: vnode.key,
        props: vnode.props, //属性
        stateNode: null, //不同类型组件真实dom节点，stateNode不同，比如原生组件是dom节点，类组件是实例
        child: null, //第一个子fiber
        sibling: null,
        return: returnFiber,
        flags: Placement, //当前fiber要进行的操作，二进制
        index: null, //记录节点在当前层级下的位置

        alternate: null, //上一次的fiber,用于比较

        memorizedState: null, //函数组件存储的第一个hook0
    };
    const { type } = vnode;
    if (isStr(type)) {
        fiber.tag = HostComponent; //为string时是原生标签
    } else if (isFn(type)) {
        //todo 函数组件和类组件都是function
        fiber.tag = type.prototype.isReactComponent
            ? ClassComponent
            : FunctionComponent;
    } else if (isUndefined(type)) {
        fiber.tag = HostText;
        fiber.props = { children: vnode };
    } else {
        fiber.tag = Fragment;
    }

    return fiber;
}
