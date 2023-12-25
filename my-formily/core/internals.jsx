import { autorun, batch, toJS } from "../../demo/watch-formily";
export const validateSelf = (field) => {
    let value = field.value;

    if (typeof value === "string") {
        value = value.trim();
    }
    const query = field.query;

    if (query.required && !value) {
        field.selfErrors.push("必填");
    }
};

export const creatReactions = (field) => {
    const reactions = field.props.reactions;
    if (typeof reactions === "function") {
        autorun(
            batch.scope.bound(() => {
                reactions(field);
            })
        );
    }
};

export const batchValidate = async (target) => {
    target.errors = [];
    for (const key in target.fields) {
        const field = target.fields[key];

        validateSelf(field);
        if (field.selfErrors[0]) {
            target.errors.push({ key, msg: field.selfErrors[0] });
        }
    }

    if (target.errors.length) {
        throw new Error("校验失败");
    }
};
export const batchSubmit = async (target, onSubmit) => {
    await batchValidate(target);
    const res = onSubmit(toJS(target.values));
    return res;
};
