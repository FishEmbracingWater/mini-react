import { scheduleUpdateOnFiber } from "./ReactWorkLoop";
import { areHookInputsEqual, HookLayout, HookPassive } from "./utils";

let currentlyRenderingFiber = null; //当前正在渲染的fiber
let workInProgressHook = null; //当前正在工作的hook

let currentHook = null; //老hook

/**获取当前正在工作的hook */
function updateWorkInProgressHook() {
    let hook;

    const current = currentlyRenderingFiber.alternate; //老的，上一次的fiber
    if (current) {
        //组件更新
        currentlyRenderingFiber.memorizedState = current.memorizedState;
        if (workInProgressHook) {
            //说明不是第一个hook
            workInProgressHook = hook = workInProgressHook.next;
            currentHook = currentHook.next;
        } else {
            //hook0
            workInProgressHook = hook = currentlyRenderingFiber.memorizedState;
            currentHook = current.memorizedState;
        }
    } else {
        //组件初次渲染
        currentHook = null;

        hook = {
            memorizedState: null, //state
            next: null, //下一个hook
        };
        if (workInProgressHook) {
            //说明不是第一个hook
            workInProgressHook = workInProgressHook.next = hook;
        } else {
            //说明是第一个hook
            workInProgressHook = currentlyRenderingFiber.memorizedState = hook;
        }
    }
    return hook;
}

/**每次渲染前，从WorkLoop中获取当前正在渲染的fiber */
export function renderWithHooks(wip) {
    currentlyRenderingFiber = wip;
    currentlyRenderingFiber.memorizedState = null;
    workInProgressHook = null;

    currentlyRenderingFiber.updateQueueOfEffect = []; //源码中这块使用的是链表，这里简化了，分成了2个数组
    currentlyRenderingFiber.updateQueueOfLayout = [];
}

export function useReducer(redeucer, initalState) {
    const hook = updateWorkInProgressHook();
    if (!currentlyRenderingFiber.alternate) {
        //说明是第一次渲染
        hook.memorizedState = initalState;
    }

    const dispatch = dispatchReducerAction.bind(
        null,
        currentlyRenderingFiber,
        hook,
        redeucer
    );

    return [hook.memorizedState, dispatch];
}

function dispatchReducerAction(fiber, hook, redeucer, action) {
    hook.memorizedState = redeucer ? redeucer(hook.memorizedState) : action;
    fiber.alternate = { ...fiber };
    fiber.sibling = null;
    scheduleUpdateOnFiber(fiber);
}

export function useState(initalState) {
    return useReducer(null, initalState);
}

function updateEffectImp(HookFlags, crate, deps) {
    const hook = updateWorkInProgressHook();

    if (currentHook) {
        const prevEffect = currentHook.memorizedState;
        if (deps) {
            const prevDeps = prevEffect.deps;
            if (areHookInputsEqual(deps, prevDeps)) {
                return;
            }
        }
    }

    const effect = { HookFlags, crate, deps };
    hook.memorizedState = effect;
    if (HookFlags & HookPassive) {
        currentlyRenderingFiber.updateQueueOfEffect.push(effect);
    } else if (HookFlags & HookLayout) {
        currentlyRenderingFiber.updateQueueOfLayout.push(effect);
    }
}

export function useEffect(crate, deps) {
    return updateEffectImp(HookPassive, crate, deps);
}

export function useLayoutEffect(crate, deps) {
    return updateEffectImp(HookLayout, crate, deps);
}
