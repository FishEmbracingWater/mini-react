import {
    makeAutoObservable,
    makeObservable,
    observable,
    action,
} from "../../watch-mobx";

class Count {
    constructor() {
        // makeAutoObservable(this);//简易写法
        makeObservable(this, {
            num: observable,
            add: action,
        });
    }

    num = 0;

    add() {
        this.num++;
    }
}

const count = new Count();
export default count;
