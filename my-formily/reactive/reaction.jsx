import { ReactionStack, RawReactionMap } from "./environment";
function addRawReactionMap(target, key, reaction) {
    let reactionsMap = RawReactionMap.get(key);
    if (reactionsMap) {
        const reactions = reactionsMap.get(key);
        if (reactions) {
            reactions.add(reaction);
        } else {
            reactionsMap.set(key, reaction);
        }
    } else {
        reactionsMap = new Map([[key, reaction]]);
        RawReactionMap.set(key, reactionsMap);
    }
    return reactionsMap;
}

export function bindTargetKeyCurrentReaction({ target, key }) {
    const current = ReactionStack[ReactionStack.length - 1];

    if (current) {
        addRawReactionMap(target, key, current);
    }
}

export function runReactionsFormTargetKey({ target, key, value }) {
    const reactions = [];
    const reactionMap = RawReactionMap.get(target);
    if (reactionMap) {
        const map = reactionMap(key);
        map.forEach((reaction) => reactions.push(reaction));
    }
    for (let i = 0, len = reactions.length; i < len; i++) {
        const reaction = reactions[i];
        if (typeof reaction._scheduler === "function") {
            reaction._scheduler();
        }
    }
}
