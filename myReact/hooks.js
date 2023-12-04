import { scheduleUpdateOnFiber } from "./ReactWorkLoop";

let currentlyRenderingFiber = null; //当前正在渲染的fiber
let workInProgressHook = null; //当前正在工作的hook

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
        } else {
            //hook0
            workInProgressHook = hook = currentlyRenderingFiber.memorizedState;
        }
    } else {
        //组件初次渲染
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
    console.log(wip);
    currentlyRenderingFiber = wip;
    currentlyRenderingFiber.memorizedState = null;
    workInProgressHook = null;
}

export function useReducer(redeucer, initalState) {
    const hook = updateWorkInProgressHook();
    if (!currentlyRenderingFiber.alternate) {
        //说明是第一次渲染
        hook.memorizedState = initalState;
    }
    const dispatch = () => {
        hook.memorizedState = redeucer(hook.memorizedState);
        currentlyRenderingFiber.alternate = { ...currentlyRenderingFiber };
        scheduleUpdateOnFiber(currentlyRenderingFiber);
    };

    return [hook.memorizedState, dispatch];
}
