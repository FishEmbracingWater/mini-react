import { useParentForm } from "../../demo/watch-formily";
import React, { useState, useEffect } from "react";

const mySubmit = ({
    children,
    onSubmit,
    onSubmitSuccess,
    onSubmitFailed,
    onClick,
}) => {
    //todo 获取form表单
    const form = useParentForm();
    return (
        <button
            onClick={(e) => {
                if (onClick) {
                    if (onClick(e) === false) {
                        return;
                    }
                }
                if (onSubmit) {
                    form.submit(onSubmit)
                        .then(onSubmitSuccess)
                        .catch(onSubmitFailed);
                }
            }}
        >
            {children}
        </button>
    );
};
export default mySubmit;
