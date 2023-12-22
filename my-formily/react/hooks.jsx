import { useContext } from "react";
import { FormContext } from "./FieldContext";
export function useParentForm() {
    const form = useContext(FormContext);
    return form;
}
