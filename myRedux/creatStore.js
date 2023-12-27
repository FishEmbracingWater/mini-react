//观察者模式
export default function createStore(reducer, enhamcer) {
    if (enhamcer) {
        return enhamcer(createStore)(reducer);
    }
    let currentState;
    let currentListeners = [];
    function getState() {
        return currentState;
    }

    function dispatch(action) {
        currentState = reducer(currentState, action);
        currentListeners.forEach((callback) => callback());
    }

    function subscribe(listener) {
        currentListeners.push(listener);
        return () => {
            const index = currentListeners.indexOf(listener);
            currentListeners.splice(index, 1);
        };
    }

    dispatch({ type: "Redunce111111231231231" });
    return {
        getState,
        dispatch,
        subscribe,
    };
}
