import {
    updateHostComponent,
    updateFunctionComponent,
    updateClassComponent,
    updateFragmentComponent,
    updateHostTextComponent,
} from "./ReactReconciler";
import {
    ClassComponent,
    Fragment,
    FunctionComponent,
    HostComponent,
    HostText,
} from "./ReactWorkTags";
import { scheduleCallback } from "./scheduler";
import { Placement, Update, updateNode } from "./utils";

let wip = null; //work in progress 当前正在工作中的fiber
let wipRoot = null; //根fiber

/**初次渲染和更新 */
export function scheduleUpdateOnFiber(fiber) {
    // console.log("scheduleUpdateOnFiber", fiber);
    wip = fiber;
    wipRoot = fiber;
    scheduleCallback(workLoop);
}

function performUnitOfWork() {
    const { tag } = wip;
    //todo 1.更新当前组件

    switch (tag) {
        case HostComponent:
            updateHostComponent(wip);
            break;
        case FunctionComponent:
            updateFunctionComponent(wip);
            break;
        case ClassComponent:
            updateClassComponent(wip);
            break;
        case Fragment:
            updateFragmentComponent(wip);
            break;
        case HostText:
            updateHostTextComponent(wip);
            break;
        default:
            break;
    }

    //todo 2.返回下一个工作单元
    //先找子元素，再找兄弟元素，再找父元素的兄弟元素
    if (wip.child) {
        wip = wip.child;
        return;
    }

    let next = wip;

    while (next) {
        if (next.sibling) {
            wip = next.sibling;
            return;
        }
        next = next.return;
    }

    wip = null;
}
/**找到空闲时间，执行渲染 */
function workLoop() {
    while (wip) {
        performUnitOfWork(); //执行工作单元
    }
    if (!wip && wipRoot) {
        commitRoot();
    }
}

// requestIdleCallback(workLoop);

//提交更新
function commitRoot() {
    commitWorker(wipRoot);
    wipRoot = null;
}

function commitDeletions(deletions, parentNode) {
    for (let index = 0; index < deletions.length; index++) {
        parentNode.removeChild(getStateNode(deletions[index]));
    }
}

//不是每个fiber都有dom节点，返回存在的stateNode
function getStateNode(fiber) {
    let tem = fiber;
    while (!tem.stateNode) {
        tem = tem.child;
    }
    return tem.stateNode;
}

function commitWorker(wip) {
    if (!wip) return;
    //1.提交自己
    //parentNode是父fiber的stateNode
    const parentNode = getParentNode(wip.return); //wip.return.stateNode;
    const { flags, stateNode } = wip;
    if (flags & Placement && stateNode) {
        //创建新节点
        const before = getHostSibling(wip.sibling);
        insertOrAppendPlacementNode(stateNode, before, parentNode);
        // parentNode.appendChild(stateNode);
    }
    if (wip.deletions) {
        //删除wip的子节点
        commitDeletions(wip.deletions, stateNode || parentNode);
    }

    if (flags & Update && stateNode) {
        //更新属性
        updateNode(stateNode, wip.alternate.props, wip.props);
    }
    //2.提交子元素
    commitWorker(wip.child);
    //3.提交兄弟元素
    commitWorker(wip.sibling);
}

/**判断wip的stateNode是否是dom，不是则查找它的父元素 */
function getParentNode(wip) {
    let tem = wip;
    while (tem) {
        if (tem.stateNode) return tem.stateNode;
        tem = tem.return;
    }
}

function getHostSibling(sibling) {
    while (sibling) {
        if (sibling.stateNode && !(sibling.flags & Placement)) {
            return sibling.stateNode;
        }
        sibling = sibling.sibling;
    }
    return null;
}

/**判断节点后面能不能插入 */
function insertOrAppendPlacementNode(stateNode, before, parentNode) {
    if (before) {
        parentNode.insertBefore(stateNode, before);
    } else {
        parentNode.appendChild(stateNode);
    }
}
