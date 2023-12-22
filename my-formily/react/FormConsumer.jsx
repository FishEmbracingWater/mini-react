import { observer } from "../../demo/watch-formily";
import { useContext } from "react";
import { FormContext } from "./FieldContext";

const FormConsumer = (props) => {
    const form = useContext(FormContext);
    const children = props.children(form);
    return children;
};
export default observer(FormConsumer);
