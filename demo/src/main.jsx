import React from "react";
import ReactDOM from "react-dom/client";
import {
    Component,
    useReducer,
    useState,
    useEffect,
    useLayoutEffect,
} from "react";
// import {
//     // ReactDOM,
//     Component,
//     useReducer,
//     useState,
//     useEffect,
//     useLayoutEffect,
// } from "../which-react";

import "./index.css";

import {
    // FormItem,
    FormLayout,
    // Input,
    FormButtonGroup,
    // Submit,
} from "@formily/antd";
import {
    createForm,
    FormProvider,
    FormConsumer,
    Field,
    FormItem,
    Input,
    Submit,
} from "../watch-formily";

function FunctionHooksComponent(props) {
    const [count, setCount] = useReducer((x) => x + 1, 0);
    const [count2, setCount2] = useState(0);

    useEffect(() => {
        console.log("omg useEffect", count2); //sy-log
    }, [count2]);

    useLayoutEffect(() => {
        console.log("omg useLayoutEffect", count2); //sy-log
    }, [count2]);

    return (
        <div className="border">
            <p>{props.name}</p>
            <button onClick={() => setCount()}>{count}</button>
            <button
                onClick={() => {
                    setCount2(count2 + 1);
                }}
            >
                {count2}
            </button>

            {count % 2 ? <div>omg</div> : <span>123</span>}

            <ul>
                {/* {count2 === 2
          ? [0, 1, 3, 4].map((item) => {
              return <li key={item}>{item}</li>;
            })
          : [0, 1, 2, 3, 4].map((item) => {
              return <li key={item}>{item}</li>;
            })} */}

                {count2 === 2
                    ? [2, 1, 3, 4].map((item) => {
                          return <li key={item}>{item}</li>;
                      })
                    : [0, 1, 2, 3, 4].map((item) => {
                          return <li key={item}>{item}</li>;
                      })}
            </ul>
        </div>
    );
}

function FunctionComponent(props) {
    const [count, setCount] = useReducer((x) => x + 1, 0);
    const [count2, setCount2] = useState(0);

    useEffect(() => {
        console.log("useEffect", count);
    }, [count]);

    useLayoutEffect(() => {
        console.log("useLayoutEffect");
    }, []);
    return (
        <div>
            <div>{props.name}</div>
            <button onClick={() => setCount()}>{count}</button>
            <button onClick={() => setCount2(count2 > 4 ? 2 : count2 + 1)}>
                {count2}
            </button>
            {count2 % 2 ? <div>omg</div> : <span>123</span>}
            <ul>
                {[0, 1].map((item) => {
                    return <li key={item}>{item}</li>;
                })}
            </ul>
        </div>
    );
}

function FormlyComponent() {
    const form = createForm({ initialValues: { input: "123" } });
    return (
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
    );
}
class ClassComponent extends Component {
    render() {
        return (
            <div className="border">
                <h3>{this.props.name}</h3>
                我是文本
            </div>
        );
    }
}

function FragmentComponent() {
    return (
        <ul>
            <>
                <li>part1</li>
                <li>part2</li>
            </>
        </ul>
    );
}

const jsx = (
    <div className="border">
        {/* <h1>react</h1>
        <a href="https://github.com/bubucuo/mini-react">mini react</a> */}
        <FunctionComponent name="函数组件" />
        <FormlyComponent />
        {/* <ClassComponent name="类组件" /> */}
        <FragmentComponent />
        {/* <FunctionHooksComponent /> */}
    </div>
);

ReactDOM.createRoot(document.getElementById("root")).render(jsx);

// 实现了常见组件初次渲染

// 原生标签
// 函数组件
// 类组件
// 文本
// Fragment
