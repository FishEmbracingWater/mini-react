// import { createStore,applyMiddleware } from "redux";
import {
    createStore,
    applyMiddleware,
    combineReducers,
} from "../../watch-redux";
// import { thunk } from "redux-thunk";
// import logger from "redux-logger";
import promise from "redux-promise";

function countReducer(state = 0, action) {
    console.log(state, action);
    switch (action.type) {
        case "add":
            return state + 1;
        case "minus":
            return state - 1;
        default:
            return state;
    }
}

//创建store {count:0,user:{name:"xxx"}
const store = createStore(
    combineReducers({
        count: countReducer,
        ReactReduxCount: countReducer,
    }),
    applyMiddleware(promise, thunk, logger)
);

export default store;

function logger({ getState, dispatch }) {
    return (next) => (action) => {
        console.log(next);
        const prevState = getState();
        console.log("prev state", prevState);
        const returnValue = next(action);
        //等状态值修改后，执行getState,拿到最新值
        const nextState = getState();
        console.log("next state", nextState);
        return returnValue;
    };
}

function thunk({ getState, dispatch }) {
    return (next) => (action) => {
        if (typeof action === "function") {
            return action(dispatch, getState);
        }
        return next(action);
    };
}
