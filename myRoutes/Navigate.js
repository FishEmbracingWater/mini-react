import { useNavigate } from "./hooks";
import { useEffect } from "react";

export default function Navigate({ to, replace, state, ...rest }) {
    const navigate = useNavigate();
    useEffect(() => {
        navigate(to, { replace, state });
    });
    return null;
}
