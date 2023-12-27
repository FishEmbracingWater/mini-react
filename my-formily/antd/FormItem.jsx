import { FieldContext, observer } from "../../demo/watch-formily";

import React, { useContext } from "react";

const FromItem = observer(({ children }) => {
    const field = useContext(FieldContext);
    return (
        <div>
            <div>{field.title}</div>
            {children}
            <div className="red">{field.selfErrors.join(",")}</div>
        </div>
    );
});
export default FromItem;
