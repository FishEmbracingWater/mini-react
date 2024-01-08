import React, { memo } from "react";
import { useObserver } from "./useObserver";
export default function observer<p>(baseComponent: React.FunctionComponent<p>) {
    const baseComponentName = baseComponent.displayName || baseComponent.name;
    let observerCompent = (props) => {
        return useObserver(() => baseComponent(props), baseComponentName);
    };
    observerCompent = memo(observerCompent);
    return observerCompent;
}
