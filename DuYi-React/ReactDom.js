import { createFiber } from "./ReactFiber.js";
import { scheduleUpdateOnFiber } from "./ReactWorkLoop.js";
class ReactDomRoot {
    constructor(container) {
        //将拿到的根节点在内部保存一份
        this._internalRoot = container;
    }
}

/**
 * @param {*} children 要挂载到根节点的 vnode 树
 */
ReactDomRoot.prototype.render = function (children) {
    const root = this._internalRoot;
    updateContainer(children, root);//更新容器
};

/**
 * 更新容器的方法
 * @param {*} element 要挂载的 vnode 树
 * @param {*} container 容器的Dom节点
 */
function updateContainer(element, container) {
    const fiber = createFiber(element, {
        //该对象是一个父 fiber 对象，里面会放置一些核心属性
        type: container.nodeName.toLowerCase(),
        stateNode: container,
    });
    //组件初次渲染，需要创建DOM节点
    scheduleUpdateOnFiber(fiber);
}

function createRoot(container) {
    return new ReactDomRoot(container);
}

const ReactDon = {
    /**
     * @param {HTMLElement} container 要挂载的根Dom节点
     * @return 返回的是一个对象，该对象有一个render方法，用于渲染组件
     */
    createRoot,
}

export default ReactDon;
