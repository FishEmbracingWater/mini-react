import React, { useContext, useRef } from "react";
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

import store from "./store";
import "./index.css";

import { FormLayout, FormButtonGroup } from "@formily/antd";
import {
    createForm,
    FormProvider,
    FormConsumer,
    Field,
    FormItem,
    Input,
    Submit,
} from "../watch-formily";
import {
    bindActionCreators,
    Provider,
    useSelector,
    useDispatch,
    connect,
} from "../watch-redux";

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

function ReduxComponent() {
    const [, forceUpdate] = useReducer((x) => x + 1, 0);
    const unsubscribe = useRef(null);
    useEffect(() => {
        unsubscribe.current = store.subscribe(() => forceUpdate());
    }, [store.getState()]);
    const getUnsubscribe = () => {
        unsubscribe.current();
    };
    useEffect(() => {
        return () => getUnsubscribe();
    }, []);
    return (
        <div className="border">
            <h3>redux</h3>
            <p>{store.getState().count}</p>
            <button onClick={() => store.dispatch({ type: "add" })}>+1</button>
            <button
                onClick={() =>
                    // setTimeout(() => {
                    //     store.dispatch({ type: "minus" });
                    // }, 1000)
                    store.dispatch((dispatch, getState) => {
                        setTimeout(() => {
                            dispatch({ type: "minus" });
                        }, 1000);
                    })
                }
            >
                -1
            </button>
            <button
                onClick={() => {
                    store.dispatch(
                        Promise.resolve({ type: "add", payload: 1000 })
                    );
                }}
            >
                promise +1
            </button>
        </div>
    );
}

const ReactReduxComponent = connect(
    // mapStateToProps,
    // (state) => {
    //     return state;
    // }
    ({ ReactReduxCount }) => ({ ReactReduxCount }),
    // mapDispatchToProps
    // (dispatch) => {
    //     let creators = {
    //         add: () => ({ type: "add" }),
    //         minus: () => ({ type: "minus" }),
    //     };
    //     creators = bindActionCreators(creators, dispatch);
    //     return { dispatch, ...creators };
    // }
    {
        add: () => ({ type: "add" }),
        minus: () => ({ type: "minus" }),
    }
)((props) => {
    const { ReactReduxCount, dispatch, add, minus } = props;
    return (
        <div className="border">
            <h3>react-redux</h3>
            <p>{ReactReduxCount}</p>
            <button onClick={() => add(1)}>+1</button>
            <button onClick={() => minus()}>-1</button>
        </div>
    );
});

function ReactReduxHookComent() {
    const count = useSelector(({ count }) => count);
    const dispatch = useDispatch();
    return (
        <div className="border">
            <h3>react-redux-hook</h3>
            <p>{count}</p>
            <button onClick={() => dispatch({ type: "add" })}>+1</button>
            <button onClick={() => dispatch({ type: "minus" })}>-1</button>
        </div>
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
        <ReduxComponent />
        <ReactReduxComponent />
        <ReactReduxHookComent />
        <FormlyComponent />
        {/* <ClassComponent name="类组件" /> */}
        <FragmentComponent />
        {/* <FunctionHooksComponent /> */}
    </div>
);

ReactDOM.createRoot(document.getElementById("root")).render(
    <Provider store={store}>{jsx}</Provider>
);

// 实现了常见组件初次渲染

// 原生标签
// 函数组件
// 类组件
// 文本
// Fragment
