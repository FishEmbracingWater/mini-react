import React, { useState, useEffect } from "react";
import count from "../mobxStore";
import time from "../mobxStore/time";
import todoStore from "../mobxStore/TodoStore";
import { Observer, observer } from "../../watch-mobx";

function MobxReactComponebt(props) {
    console.log("MobxReactComponebt render");
    useEffect(() => {
        const ti = setInterval(() => {
            time.add();
        }, 1000);
        return () => {
            clearInterval(ti);
        };
    }, []);

    return (
        <div className="border">
            <h3>mobx-react</h3>
            <Observer>
                {() => <button onClick={() => count.add()}>{count.num}</button>}
            </Observer>
            <Observer>{() => <div>当前停留时间:{time.num}s</div>}</Observer>
            {todoStore.todoList.map((todo, index) => (
                <TodoView key={index} todo={todo} index={index} />
            ))}
            <button onClick={() => todoStore.addTodo(prompt("请输入任务"))}>
                add todo
            </button>
            <div>完成了{todoStore.completedTodosCount}个任务</div>
        </div>
    );
}

const TodoView = observer(({ todo, index }) => {
    return (
        <li>
            <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => todoStore.toggleTodo(index)}
            />
            {todo.task}
        </li>
    );
});

export default observer(MobxReactComponebt);
