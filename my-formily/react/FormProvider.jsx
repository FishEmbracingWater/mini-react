import React, { useState, useEffect } from "react";
import { FormContext } from "./FieldContext";

export default function FormProvider({ form, children }) {
    useEffect(() => {
        form.onMount();
        return () => {
            form.onUnmount();
        };
    }, []);

    return <FormContext.Provider value={form}>{children}</FormContext.Provider>;
}
