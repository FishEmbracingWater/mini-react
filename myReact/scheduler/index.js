import { peek, push, pop } from "./minHeap";

let taskQuene = [];
let taskIdCounter = 1;

/**调度任务 */
export function scheduleCallback(callback) {
    const currentTime = getCurrntTime();
    const timeout = -1;
    const expirtationTime = currentTime + timeout;

    const newTask = {
        id: taskIdCounter++,
        callback,
        expirtationTime,
        sortIndex: expirtationTime,
    };

    push(taskQuene, newTask);

    //请求调度,宏任务
    requestHostCallback();
}

function requestHostCallback() {
    port.postMessage(null);
}

const channel = new MessageChannel();
const port = channel.port2;

channel.port1.onmessage = function () {
    workLoop();
};

function workLoop() {
    let currentTask = peek(taskQuene);
    while (currentTask) {
        const callback = currentTask.callback;
        currentTask.callback = null;
        callback();
        pop(taskQuene);
        currentTask = peek(taskQuene);
    }
}

/**获取当前时间 */
export function getCurrntTime() {
    return performance.now();
}
