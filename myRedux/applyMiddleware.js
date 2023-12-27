import compose from "./compose";

export default function applyMiddleware(...middlewares) {
    return (createStore) => (reducer) => {
        const store = createStore(reducer);
        let dispatch = store.dispatch;
        //todo 加强dispatch
        const midApi = {
            getState: store.getState,
            dispatch: (action, ...args) => dispatch(action, ...args),
        };
        const middlewareChain = middlewares.map((middleware) =>
            middleware(midApi)
        );

        //把所有的中间件的函数都执行了之后，同时还要执行store.dispatch
        dispatch = compose(...middlewareChain)(store.dispatch);

        return { ...store, dispatch };
    };
}
