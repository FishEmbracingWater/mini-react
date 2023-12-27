//context传值 跨组件层级传递数据
import React, {
    useContext,
    useLayoutEffect,
    useReducer,
    useSyncExternalStore,
} from "react";
import { bindActionCreators } from "../myRedux";

const Context = React.createContext();

// !1.Provider组件传递Value (store)
export function Provider({ store, children }) {
    return <Context.Provider value={store}>{children}</Context.Provider>;
}

//!2.后代消费Provider传递的Value
// *contextType 只能用在类组件中，且只能订阅单一的context来源
// *useContext 只能用在函数组件或者自定义hook中
// *Consumer 没有组件限制

export const connect = (mapStateToProps, mapDispatchToProps) => (
    WrappedComponent
) => (props) => {
    const store = useContext(Context);
    const { getState, dispatch, subscribe } = store;

    let dispatchProps = { dispatch };

    if (typeof mapDispatchToProps === "function") {
        dispatchProps = mapDispatchToProps(dispatch);
    } else if (typeof mapDispatchToProps === "object") {
        dispatchProps = bindActionCreators(mapDispatchToProps, dispatch);
    }
    const forceUpdate = useForceUpdate();
    //因为useLayoutEffect是在dom更新之后执行的，所以在useLayoutEffect中订阅store的更新，
    //就可以保证在组件更新之后，再去更新组件
    // const stateProps = mapStateToProps ? mapStateToProps(getState()) : {};
    // useLayoutEffect(() => {
    //     const unsubscribe = subscribe(() => {
    //         forceUpdate();
    //     });
    //     return () => {
    //         unsubscribe();
    //     };
    // }, [subscribe]);
    //todo react18新增hook改写
    //useSyncExternalStore 用于同步外部store的状态,并且在store更新后更新组件
    const state = useSyncExternalStore(() => {
        subscribe(forceUpdate);
    }, getState);
    const stateProps = mapStateToProps ? mapStateToProps(state) : {};

    return <WrappedComponent {...props} {...stateProps} {...dispatchProps} />;
};

function useForceUpdate() {
    const [, forceUpdate] = useReducer((x) => x + 1, 0);
    return forceUpdate;
}

export function useSelector(selector) {
    const store = useContext(Context);
    const { getState, subscribe } = store;
    const forceUpdate = useForceUpdate();
    // const selectedState = selector(getState());
    // useLayoutEffect(() => {
    //     const unsubscribe = subscribe(() => {
    //         forceUpdate();
    //     });
    //     return () => {
    //         unsubscribe();
    //     };
    // }, [subscribe]);

    const state = useSyncExternalStore(() => {
        subscribe(forceUpdate);
    }, getState);
    const selectedState = selector(state);
    return selectedState;
}

export function useDispatch() {
    const store = useContext(Context);
    const { dispatch } = store;
    return dispatch;
}
