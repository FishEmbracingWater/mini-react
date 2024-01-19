import React, { useContext, useRef } from "react";
import ReactDOM from "react-dom/client";
import { useReducer, useState, useEffect, useLayoutEffect } from "react";
// import {
//     // ReactDOM,
//     Component,
//     useReducer,
//     useState,
//     useEffect,
//     useLayoutEffect,
// } from "../which-react";

import store from "./store";
import "./index.css";

import {
    bindActionCreators,
    Provider,
    useSelector,
    useDispatch,
    connect,
} from "../watch-redux";
import RouteComponent from "./page/RouteComponent";
import ReactComponent from "./page/ReactCompontent";
import FormlyComponent from "./page/FormlyComponent";
import MobxReactComponent from "./page/MobxReactComponent";

function ReduxComponent() {
    const [, forceUpdate] = useReducer((x) => x + 1, 0);
    const unsubscribe = useRef(null);
    useEffect(() => {
        unsubscribe.current = store.subscribe(() => forceUpdate());
    }, [store.getState()]);
    const getUnsubscribe = () => {
        unsubscribe.current();
    };
    useEffect(() => {
        return () => getUnsubscribe();
    }, []);
    return (
        <div className="border">
            <h3>redux</h3>
            <p>{store.getState().count}</p>
            <button onClick={() => store.dispatch({ type: "add" })}>+1</button>
            <button
                onClick={() =>
                    // setTimeout(() => {
                    //     store.dispatch({ type: "minus" });
                    // }, 1000)
                    store.dispatch((dispatch, getState) => {
                        setTimeout(() => {
                            dispatch({ type: "minus" });
                        }, 1000);
                    })
                }
            >
                -1
            </button>
            <button
                onClick={() => {
                    store.dispatch(
                        Promise.resolve({ type: "add", payload: 1000 })
                    );
                }}
            >
                promise +1
            </button>
        </div>
    );
}

const ReactReduxComponent = connect(
    // mapStateToProps,
    // (state) => {
    //     return state;
    // }
    ({ ReactReduxCount }) => ({ ReactReduxCount }),
    // mapDispatchToProps
    // (dispatch) => {
    //     let creators = {
    //         add: () => ({ type: "add" }),
    //         minus: () => ({ type: "minus" }),
    //     };
    //     creators = bindActionCreators(creators, dispatch);
    //     return { dispatch, ...creators };
    // }
    {
        add: () => ({ type: "add" }),
        minus: () => ({ type: "minus" }),
    }
)((props) => {
    const { ReactReduxCount, dispatch, add, minus } = props;
    return (
        <div className="border">
            <h3>react-redux</h3>
            <p>{ReactReduxCount}</p>
            <button onClick={() => add(1)}>+1</button>
            <button onClick={() => minus()}>-1</button>
        </div>
    );
});

function ReactReduxHookComent() {
    const count = useSelector(({ count }) => count);
    const dispatch = useDispatch();
    return (
        <div className="border">
            <h3>react-redux-hook</h3>
            <p>{count}</p>
            <button onClick={() => dispatch({ type: "add" })}>+1</button>
            <button onClick={() => dispatch({ type: "minus" })}>-1</button>
        </div>
    );
}

const jsx = (
    <div className="border">
        {/* <h1>react</h1>
        <a href="https://github.com/bubucuo/mini-react">mini react</a> */}
        <RouteComponent />
        {/* <MobxReactComponent /> */}
        {/* <ReactComponent /> */}
        {/* <ReduxComponent /> */}
        {/* <ReactReduxComponent /> */}
        {/* <ReactReduxHookComent /> */}
        {/* <FormlyComponent /> */}
    </div>
);

ReactDOM.createRoot(document.getElementById("root")).render(
    <Provider store={store}>{jsx}</Provider>
);
