import { peek, push, pop } from "./minHeap";
import { isObject } from "../utils";
import { getTimeoutByPriorityLevel } from "./SchedulerPriorities";

let taskQuene = [];
let timerQuene = [];
let taskIdCounter = 1;

/**调度任务
 * @param options {delay:number}
 */
export function scheduleCallback(callback, priorityLevel, options) {
    const currentTime = getCurrntTime();
    let startTime;

    if (isObject(options) && options !== null) {
        let delay = options?.delay;
        if (typeof delay === "number" && delay > 0) {
            startTime = currentTime + delay;
        } else {
            startTime = currentTime;
        }
    }
    let timeout = getTimeoutByPriorityLevel(priorityLevel);
    const expirtationTime = startTime + timeout;

    const newTask = {
        id: taskIdCounter++,
        callback,
        priorityLevel, //调度器优先级
        startTime, //任务进入调度器的理论时间
        expirtationTime, //过期时间
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
