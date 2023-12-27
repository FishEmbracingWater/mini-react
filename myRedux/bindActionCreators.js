export default function bindActionCreators(actionCreators, dispatch) {
    let obj = {};
    for (let key in actionCreators) {
        obj[key] = bindActionCreator(actionCreators[key], dispatch);
        // obj[key] = (...args) => dispatch(actionCreators[key](...args));
    }
    return obj;
}

function bindActionCreator(actionCreator, dispatch) {
    return function (...args) {
        console.log("bindActionCreator", args);
        return dispatch(actionCreator(...args));
    };
}
