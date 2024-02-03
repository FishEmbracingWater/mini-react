import { peek, push, pop } from "./minHeap";
import { isObject, isFn } from "../utils";
import {
    getTimeoutByPriorityLevel,
    NormalPriority,
} from "./SchedulerPriorities";

//任务存储，最小堆
let taskQuene = [];
let timerQuene = [];

let taskIdCounter = 1;

let currentTask = null; //当前正在执行的任务
let currentPriorityLevel = NormalPriority;
//在计时
let isHostTimeoutScheduled = false;
//在调度任务
let isHostCallbackScheduled = false;
let isPerformingWork = false; //防止重复进入
let isMessageLoopRunning = false;
let scheduledHostcallback = null;
let taskTimeoutID = -1; //存储settimeout，保证每次都只有一个settimeout在执行

let schedulePerformWorkUntilDeadline = null;
/**调度任务
 * @param priorityLevel 优先级
 * @param options {delay:number}
 */
export function scheduleCallback(callback, priorityLevel, options) {
    //任务进入调度器的时间
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
        sortIndex: -1, //最小堆排序的依据
    };

    if (startTime > currentTime) {
        //延迟任务
        newTask.sortIndex = startTime;
        push(timerQuene, newTask);

        if (peek(taskQuene) === null && peek(timerQuene) === newTask) {
            //当前没有任务在执行，并且当前任务是最先执行的任务
            if (isHostTimeoutScheduled) {
                cancelHostTimeout();
            } else {
                isHostTimeoutScheduled = true;
            }
            requestHostTiomeout(handleTimeout, startTime - currentTime);
        }
    } else {
        //立即执行任务
        newTask.sortIndex = expirtationTime;
        push(taskQuene, newTask);
        //请求调度,宏任务
        if (!isHostCallbackScheduled && !isPerformingWork) {
            isHostCallbackScheduled = true;
            requestHostCallback(falshWork);
        }
    }
}

function requestHostTiomeout(callback, ms) {
    taskTimeoutID = setTimeout(() => {
        callback(getCurrntTime());
    }, ms);
}

/**检查timerQueue中的任务，是否有到期了呢，到期了把当前有效任务移动到taskQuene中 */
function advanceTimers(currentTime) {
    let timer = peek(timerQuene);
    while (timer !== null) {
        if (timer.callback === null) {
            pop(timerQuene);
        } else if (timer.startTime <= currentTime) {
            pop(timerQuene);
            timer.sortIndex = timer.expirtationTime;
            push(taskQuene, timer);
        } else {
            return;
        }
        timer = peek(timerQuene); //查看是否还有任务过期
    }
}

/**倒计时到点了 */
function handleTimeout(currentTime) {
    isHostTimeoutScheduled = false;
    advanceTimers(currentTime);
    if (!isHostCallbackScheduled) {
        if (peek(taskQuene) !== null) {
            isHostCallbackScheduled = true;
            //请求调度,宏任务
            requestHostCallback(falshWork);
        }
    } else {
        const firstTimer = peek(timerQuene);
        if (firstTimer !== null) {
            requestHostTiomeout(
                handleTimeout,
                firstTimer.startTime - currentTime
            );
        }
    }
}

function falshWork(hasTimeRemaining, initialTime) {
    isHostCallbackScheduled = false;
    //已经进入，去除正在执行的settimeout
    if (isHostTimeoutScheduled) {
        isHostTimeoutScheduled = false;
        cancelHostTimeout();
    }
    isPerformingWork = true;

    let prevousPriorityLevel = currentPriorityLevel;

    try {
        return workLoop(hasTimeRemaining, initialTime);
    } finally {
        currentTask = null;
        currentPriorityLevel = prevousPriorityLevel; //还原之前的优先级
        isPerformingWork = false;
    }
}

function cancelHostTimeout() {
    clearTimeout(taskTimeoutID);
    taskTimeoutID = -1;
}

function requestHostCallback(callback) {
    scheduledHostcallback = callback;
    if (isMessageLoopRunning) {
        isMessageLoopRunning = true;
        schedulePerformWorkUntilDeadline();
    }
}

const PerformWorkUntilDeadline = () => {
    if (scheduledHostCallback !== null) {
        const currentTime = getCurrentTime();

        // Keep track of the start time so we can measure how long the main thread
        // has been blocked.
        startTime = currentTime;

        const hasTimeRemaining = true;
        let hasMoreWork = true;
        try {
            hasMoreWork = scheduledHostCallback(hasTimeRemaining, currentTime);
        } finally {
            if (hasMoreWork) {
                schedulePerformWorkUntilDeadline();
            } else {
                isMessageLoopRunning = false;
                scheduledHostCallback = null;
            }
        }
    } else {
        isMessageLoopRunning = false;
    }
};

const channel = new MessageChannel();
const port = channel.port2;

channel.port1.onmessage = PerformWorkUntilDeadline;

schedulePerformWorkUntilDeadline = () => {
    port.postMessage(null);
};

/**在当前时间切片内循环执行任务 */
function workLoop(hasTimeRemaining, initialTime) {
    let currentTime = initialTime;
    advanceTimers(currentTime);
    currentTask = peek(taskQuene);
    while (currentTask) {
        if (currentTask.expirationTime > currentTime && !hasTimeRemaining) {
            //当前任务还没有过期，并且没有剩余时间了
            break;
        }
        const callback = currentTask.callback;
        currentPriorityLevel = currentTask.priorityLevel;
        if (isFn(callback)) {
            currentTask.callback = null;
            const didUserCallbackTimeout =
                currentTask.expirationTime <= currentTime;
            const continuationCallback = callback(didUserCallbackTimeout);
            currentTime = getCurrntTime();
            if (isFn(continuationCallback)) {
                //任务还没有执行完
                currentTask.callback = continuationCallback;
            } else {
                if (currentTask === peek(taskQuene)) {
                    pop(taskQuene);
                }
            }
            advanceTimers(currentTime);
        } else {
            //currentTask 不是有效任务
            pop(taskQuene);
        }

        currentTask = peek(taskQuene);
    }

    //判断还有没有其他任务
    if (currentTask !== null) {
        return true;
    } else {
        const firstTimer = peek(timerQuene);
        if (firstTimer !== null) {
            requestHostTiomeout(
                handleTimeout,
                firstTimer.startTime - currentTime
            );
        }
        return false;
    }
}

/**获取当前时间 */
export function getCurrntTime() {
    return performance.now();
}
