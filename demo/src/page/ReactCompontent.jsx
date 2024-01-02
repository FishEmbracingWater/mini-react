import React, {
    useState,
    useEffect,
    useReducer,
    useLayoutEffect,
    Component,
} from "react";
// 实现了常见组件初次渲染

// 原生标签
// 函数组件
// 类组件
// 文本
// Fragment
export default function ReactComponent(props) {
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

    return (
        <>
            <FunctionComponent name="函数组件" />
            <FunctionHooksComponent />
            {/* <ClassComponent name="类组件" /> */}
            <FragmentComponent />
        </>
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
