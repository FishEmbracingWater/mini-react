import { FieldContext, observer } from "../../demo/watch-formily";

import React, { useState, useEffect, useContext } from "react";

const FromItem = observer(({ children }) => {
    const field = useContext(FieldContext);
    console.log("field", field);
    return (
        <div>
            <div>{field.title}</div>
            {children}
            <div className="red">{field.selfErrors.join(",")}</div>
        </div>
    );
});
export default FromItem;
