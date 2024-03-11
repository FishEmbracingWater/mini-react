/**
 * 该文件是调度器的具体实现
 */
import { peek, push, pop } from "./minHeap";
import { isObject, isFn } from "../utils";
import {
    getTimeoutByPriorityLevel,
    NormalPriority,
} from "./SchedulerPriorities";

//任务存储，最小堆
let taskQuene = [];
let timerQuene = [];

//任务id 计数器
let taskIdCounter = 1;

//是否有剩余时间
let hasTimeRemaining = true;

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
 * 该函数的作用是为了组装一个任务对象，然后将其放在任务队列
 * @param callback 需要执行的回调函数，改任务会在每一帧的剩余时间去执行
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
    //设置任务过期时间
    //在react源码中，针对不同的任务类型设置了不同的过期时间
    let timeout = getTimeoutByPriorityLevel(priorityLevel);
    //计算出过期的时间
    const expirtationTime = startTime + timeout;
    //组装一个新的任务对象
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
        //将新的任务推入到任务队列
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
        //获取当前时间
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

//通过MessageChannel来模拟游览器的requestIdleCallback
const channel = new MessageChannel();
const port = channel.port2;

//该方法的作用就是不停的从任务队列中去除任务，然后执行
channel.port1.onmessage = PerformWorkUntilDeadline;

schedulePerformWorkUntilDeadline = () => {
    port.postMessage(null);
};

/**在当前时间切片内循环执行任务 */
function workLoop(hasTimeRemaining, initialTime) {
    let currentTime = initialTime;
    advanceTimers(currentTime);
    //从当前任务队列中取出第一个任务
    currentTask = peek(taskQuene);
    while (currentTask) {
        //如果任务的过期时间远大于过期时间（说明任务不着急,可以延期）
        //并且当前帧的剩余时间不够了，那么就不执行
        if (currentTask.expirationTime > currentTime && !hasTimeRemaining) {
            //当前任务还没有过期，并且没有剩余时间了
            break;
        }
        //没有进入上面的if，说明当前任务是需要执行的
        const callback = currentTask.callback;
        currentPriorityLevel = currentTask.priorityLevel;
        if (isFn(callback)) {
            currentTask.callback = null;
            const didUserCallbackTimeout =
                currentTask.expirationTime <= currentTime;
            //执行对应的任务，传入过期时间
            const continuationCallback = callback(didUserCallbackTimeout);
            currentTime = getCurrntTime();
            if (isFn(continuationCallback)) {
                //任务还没有执行完
                currentTask.callback = continuationCallback;
            } else {
                if (currentTask === peek(taskQuene)) {
                    //进入此if，说明当前任务已经执行完了,将其移除
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
