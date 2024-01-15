import {
    makeAutoObservable,
    makeObservable,
    observable,
    action,
    computed,
    Reaction,
    AnnotationsMap,
} from "mobx";
import { type } from "os";
// import { Observer } from "mobx-react-lite";
import { observer, Observer, useLocalObservable } from "../my-mobx";
export type { AnnotationsMap };
export {
    Observer,
    observer,
    useLocalObservable,
    makeAutoObservable,
    makeObservable,
    observable,
    action,
    computed,
    Reaction,
};
