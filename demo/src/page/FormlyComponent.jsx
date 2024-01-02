import React from "react";
import { FormLayout, FormButtonGroup } from "@formily/antd";
import {
    createForm,
    FormProvider,
    FormConsumer,
    Field,
    FormItem,
    Input,
    Submit,
} from "../../watch-formily";
export default function FormlyComponent() {
    const form = createForm({ initialValues: { input: "123" } });
    return (
        <>
            <div>Formly</div>
            <FormProvider form={form}>
                <FormLayout layout="vertical">
                    <Field
                        name="input"
                        title="输入框"
                        required
                        initialValue="Hello world"
                        decorator={[FormItem]}
                        component={[Input]}
                    />
                </FormLayout>
                <FormConsumer>
                    {() => (
                        <div
                            style={{
                                marginBottom: 20,
                                padding: 5,
                                border: "1px dashed #666",
                            }}
                        >
                            实时响应：{form.values.input}
                        </div>
                    )}
                </FormConsumer>
                <FormButtonGroup>
                    <Submit onSubmit={console.log}>提交</Submit>
                </FormButtonGroup>
            </FormProvider>
        </>
    );
}
