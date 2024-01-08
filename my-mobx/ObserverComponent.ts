import { useObserver } from "./useObserver";

//Observer：单独剥离组件
interface IObserverProps {
    children?: () => React.ReactElement | null;
    render?: () => React.ReactElement | null;
}
function Observer({ children, render }: IObserverProps) {
    console.log("Observer", children, render);
    const component = children || render;
    if (typeof component !== "function") return null;

    return useObserver(component as any);
}

Observer.displayName = "Observer";

export default Observer;
