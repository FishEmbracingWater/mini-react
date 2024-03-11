import { scheduleUpdateOnFiber } from "./ReactWorkLoop";
import { areHookInputsEqual, HookLayout, HookPassive } from "./utils";

let currentlyRenderingFiber = null; //当前正在渲染的fiber
let workInProgressHook = null; //当前正在工作的hook

let currentHook = null; //处理完的hook

/**
 * 该方法主要是返回一个hook对象
 * 并且让 WorkInProgressHook 始终指向最后一个hook
 * 获取当前正在工作的hook
 *  */
function updateWorkInProgressHook() {
    //这个变量就是存储最终向外部返回的hook
    let hook;

    const current = currentlyRenderingFiber.alternate; //老的，上一次的fiber
    if (current) {
        //说明不是第一次渲染，存在旧的fiber，组件更新
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
        //组件初次渲染，什么都没有，需要做初始化工作
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

/**每次渲染前，从WorkLoop中获取当前正在渲染的fiber
 * 对当前fiber 以及 hooks 进行初始化
 */
export function renderWithHooks(wip) {
    //当前正在渲染的fiber 赋值给currentlyRenderingFiber
    currentlyRenderingFiber = wip;
    //将当前渲染的 fiber 对象的memorizedState置为null
    currentlyRenderingFiber.memorizedState = null;
    workInProgressHook = null;
    //存储Effect 对应的副作用和依赖项
    currentlyRenderingFiber.updateQueueOfEffect = []; //源码中这块使用的是链表，这里简化了，分成了2个数组
    currentlyRenderingFiber.updateQueueOfLayout = [];
}

/**
 * 
 * @param {*} initalState 初始化状态
 * @returns 
 */
export function useState(initalState) {
    return useReducer(null, initalState);
}

/**
 * @param {*} redeucer 改变状态的纯函数
 * @param {*} initalState 初始化状态
 */
export function useReducer(redeucer, initalState) {
    //拿到最新的hook
    //这里的hook是一个对象
    //hook ---> {memorizedState: xxx; next:xxx}
    //hook 对象里面有两个属性，一个是memorizedState用于存储数据，一个next 用于下一个hook
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

/**
 * 根据用户传入的reducer ，计算最新的状态，然后处理fiber 对象
 * @param {*} fiber 当前正在处理的fiber 对象
 * @param {*} hook 当前正在处理的hook
 * @param {*} redeucer 用户传入的reducer 函数，如果没有，说明用户调用的是useState，
 * @param {*} action useState使用，传入的就是最终状态，不用计算
 */
function dispatchReducerAction(fiber, hook, redeucer, action) {
    //获取最新的的状态
    hook.memorizedState = redeucer ? redeucer(hook.memorizedState) : action;
    //状态更新完毕，该fiber 就是旧的 fiber，需要对fiber进行处理
    fiber.alternate = { ...fiber };
    //将相邻的fiber 节点设为null，不去更新相邻节点
    fiber.sibling = null;
    scheduleUpdateOnFiber(fiber);
}



function updateEffectImp(HookFlags, crate, deps) {
    //获取最后一个hook
    const hook = updateWorkInProgressHook();
    //用于存储销毁函数
    let destory = null;
    if (currentHook) {
        //如果存在currentHook ，从hook中获取副作用和依赖项
        const prevEffect = currentHook.memorizedState;
        //保存上一次的销毁函数
        destory = prevEffect.destory;
        //判断是否有依赖项
        if (deps) {
            //进入此分支，说明本次也有依赖项，先取出上一次的依赖项和本次进行比较
            const prevDeps = prevEffect.deps;
            if (areHookInputsEqual(deps, prevDeps)) {
                //说明依赖项没有变化，直接返回
                return;
            }
        }
    }

    //组装要存储到memorizedState 中的数据
    const effect = { HookFlags, crate, deps, destory };
    hook.memorizedState = effect;
    //接下来要执行副作用函数
    //这里不是直接执行，推入到updateQueue中，等待commit阶段执行
    if (HookFlags & HookPassive) {
        currentlyRenderingFiber.updateQueueOfEffect.push(effect);
    } else if (HookFlags & HookLayout) {
        currentlyRenderingFiber.updateQueueOfLayout.push(effect);
    }
}

/**
 * 
 * @param {*} crate 要执行的副作用函数
 * @param {*} deps 依赖项
 * @returns 
 */
export function useEffect(crate, deps) {
    return updateEffectImp(HookPassive, crate, deps);
}

export function useLayoutEffect(crate, deps) {
    return updateEffectImp(HookLayout, crate, deps);
}
