import { useReducer, useRef } from "react";
import { Reaction } from "../demo/watch-mobx";

export interface IReactionTracking {
    reaction: Reaction;
}

function observerComponentNameFor(baseComponent: string) {
    return `observer${baseComponent}`;
}
export function useObserver<T>(
    fn: () => T,
    baseComponentName: string = "observed"
): T {
    const [, forceUpdate] = useReducer((s) => s + 1, 0);

    //可观察的值变化之后，组件要更新
    const reactionTrackingRef = useRef<IReactionTracking | null>(null);
    if (reactionTrackingRef) {
        reactionTrackingRef.current = {
            reaction: new Reaction(
                observerComponentNameFor(baseComponentName),
                () => forceUpdate()
            ),
        };
    }

    const { reaction } = reactionTrackingRef.current as IReactionTracking;
    let readering!: T;
    let exception;
    reaction.track(() => {
        try {
            readering = fn();
        } catch (error) {
            exception = error;
        }
    });

    return readering;
}
