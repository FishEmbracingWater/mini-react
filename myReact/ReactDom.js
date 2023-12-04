import { createFiber } from "./ReactFiber.js";
import { scheduleUpdateOnFiber } from "./ReactWorkLoop.js";
function ReactDomRoot(internalRoot) {
    this._internalRoot = internalRoot; //根节点
}

ReactDomRoot.prototype.render = function (children) {
    // console.log("render", children);
    const root = this._internalRoot;
    updateContainer(children, root);
};

/**更新容器 */
function updateContainer(element, root) {
    const { containerInfo } = root;
    const fiber = createFiber(element, {
        type: containerInfo.nodeName.toLowerCase(),
        stateNode: containerInfo,
    });
    //组件初次渲染，需要创建DOM节点
    scheduleUpdateOnFiber(fiber);
}

function createRoot(container) {
    const root = { containerInfo: container }; //将根节点封装成对象
    return new ReactDomRoot(root);
}

export default { createRoot };
