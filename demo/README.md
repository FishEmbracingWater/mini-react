React + Vite: https://juejin.cn/post/6922701449818292232

yarn create @vitejs/app demo --template react
cd demo
yarn
安装 react 的最新 rc 版本：yarn add react@rc react-dom@rc
yarn dev
浏览器端打开 http://localhost:3000/

redux 和 react-redux 的区别
redux 本身使用 js 实现的，和 react 没有直接关系，react-redux 是 redux 的一个 react 的插件，提供了一个 Provider 组件和 connect 方法，方便在 react 中使用 redux

redux 的核心概念
store：整个应用的状态，它包含了应用的全部状态，并且提供了一个 dispatch 方法，用来分发 action，action 是一个对象，包含 type 属性，用来描述 action 的类型，并且可以携带其他属性，这些属性就是 action 的 payload，store 的状态是不可变的，每次状态更新，都需要返回一个新的状态，这样才能保证状态的不可变性，这个过程就是 reducer

store.dispatch(action)：分发 action，action 是一个对象，包含 type 属性，用来描述 action 的类型，并且可以携带其他属性，这些属性就是 action 的 payload，store 的状态是不可变的，每次状态更新，都需要返回一个新的状态，这样才能保证状态的不可变性，这个过程就是 reducer

store.getState()：获取当前的状态

store.subscribe(listener)：监听状态的变化，当状态发生变化时，会调用 listener 函数
