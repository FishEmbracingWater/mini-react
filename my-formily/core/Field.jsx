import { define, observable } from "../../demo/watch-formily";
import { validateSelf, creatReactions } from "./internals";
//数据层的field类，用于存储数据和状态
export default class Field {
    constructor(name, props, form) {
        this.name = name;
        this.props = { ...props };
        this.form = form;

        this.form.fields[name] = this;

        this.component = props.component;
        this.decorator = props.decorator;

        this.selfErrors = [];

        this.value = this.form.values[name] || "";

        this.query = { required: props.required };
        this.makeObservable();
        this.makeReactive();
    }

    makeObservable = () => {
        define(this, {
            value: observable,
        });
    };

    makeReactive = () => {
        creatReactions(this);
    };

    onInput = (e) => {
        const newValue = e.target.value;

        this.value = newValue;
        this.form.values[this.props.name] = newValue;

        validateSelf(this);
    };
}
