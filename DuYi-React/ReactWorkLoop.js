import { scheduleCallback } from "./scheduler";
import { Placement, Update, updateNode } from "./utils";
import beginWork from "./ReactFiberBeginWork";
//work in progress 当前正在工作中的fiber
//使用这个变量来保存当前正在工作的fiber
let wip = null;
//根fiber
let wipRoot = null;

/**初次渲染和更新 */
export function scheduleUpdateOnFiber(fiber) {
    wip = fiber;
    wipRoot = fiber;
    //当游览器空闲时，重复执行workLoop
    scheduleCallback(workLoop);
}

/**
 * 该函数负责处理fiber节点
 * 总共要做的事情：
 * 1.处理当前的fiber对象
 * 2.通过深度优先遍历子节点，生成子节点的fiber对象，然后进行处理
 * 3.提交副作用
 * 4.进行渲染
 */
function performUnitOfWork() {
    beginWork(wip);//处理当前的fiber对象

    //todo 2.返回下一个工作单元
    //如果有子节点、将wip更新为子节点
    if (wip.child) {
        wip = wip.child;
        return;
    }

    completeWork(wip);//提交副作用

    //如果没有子节点、找到兄弟节点
    let next = wip;//先缓存一下当前的wip

    while (next) {
        if (next.sibling) {
            wip = next.sibling;
            return;
        }

        //如果没有进入上面的if、说明当前节点没有兄弟节点
        //那么就需要将父节点设置为当前正在工作的节点，然后在父节点那一层继续寻找兄弟节点
        next = next.return;

        //在寻找父节点的兄弟节点之前，先执行completeWork
        completeWork(next);
    }

    //如果执行到这里、说明所有节点都已经处理完了
    wip = null;
}
/**
 * 找到每一帧的空闲时间，执行渲染
 *  */
function workLoop(deadline) {
    while (wip && deadline.timeRemaining() > 0) {
        //进入此循环、说明有需要进行处理的fiber节点，并且也有时间执行
        performUnitOfWork(); //该方法负责处理fiber节点
    }
    //来到这里，说明要么没有时间了，要么fiber树处理完了
    if (!wip && wipRoot) {
        //说明整个fiber树处理完了
        //将wipRoot提交到dom上
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

    if (wip.tag === FunctionComponent) {
        invokeHooks(wip);
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

function invokeHooks(wip) {
    const { updateQueueOfEffect, updateQueueOfLayout } = wip;
    console.log("invokeHooks", updateQueueOfEffect, updateQueueOfLayout);
    for (let index = 0; index < updateQueueOfLayout.length; index++) {
        const effect = updateQueueOfLayout[index];
        effect.crate();
    }

    for (let index = 0; index < updateQueueOfEffect.length; index++) {
        const effect = updateQueueOfEffect[index];

        scheduleCallback(() => {
            effect.crate();
        });
    }
}
