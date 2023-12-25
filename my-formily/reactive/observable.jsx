import {
    bindTargetKeyCurrentReaction,
    runReactionsFormTargetKey,
} from "./reaction";
const baseHandlers = {
    get(target, key) {
        const result = target[key];
        //收集reaction
        bindTargetKeyCurrentReaction({ target, key });
        return result;
    },
    Set(target, key, value) {
        target[key] = value;
        //执行reactions
        runReactionsFormTargetKey({ target, key, value });
        return true;
    },
};
export default function observable(target) {
    const proxy = new Proxy(target, baseHandlers);
    return proxy;
}
