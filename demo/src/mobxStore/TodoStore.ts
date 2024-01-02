import {
    makeAutoObservable,
    makeObservable,
    observable,
    action,
    computed,
} from "../../watch-mobx";
export type Todo = {
    task: string;
    completed: boolean;
    assignee: null | string;
};

export type TodoList = Todo[];

class TodoStore {
    constructor() {
        // makeAutoObservable(this);
        makeObservable(this, {
            todoList: observable,
            addTodo: action,
            toggleTodo: action,
            completedTodosCount: computed,
        });
    }
    todoList: TodoList = [
        {
            task: "Buy Milk",
            completed: false,
            assignee: null,
        },
    ];

    addTodo = (task: string) => {
        this.todoList.push({
            task,
            completed: false,
            assignee: null,
        });
    };

    toggleTodo = (index: number) => {
        this.todoList[index].completed = !this.todoList[index].completed;
    };

    //返回完成的任务数
    get completedTodosCount() {
        return this.todoList.filter((todo) => todo.completed).length;
    }
}

const todoStore = new TodoStore();
export default todoStore;
