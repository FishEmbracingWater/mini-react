import React, { useLayoutEffect } from "react";
import { createBrowserHistory } from "history";
import Router from "./Router";
export default function BrowserRouter({ children }) {

    //组件写在之前用
    let historyRef = React.useRef();
    if (!historyRef.current) {
        historyRef.current = createBrowserHistory();
    }
    const history = historyRef.current;

    const [state, setState] = React.useState({ location: history.location });
    useLayoutEffect(() => {
        history.listen(setState);
    }, [history]);
    return <Router naviagtor={history} children={children} location={state.location}></Router>
}
