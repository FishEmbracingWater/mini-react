import creatRoutesFromChildren from './creatRoutesFromChildren';
import { useRoutes } from './hooks';
export default function Routes({children}) {
    const  routes = creatRoutesFromChildren(children);
    return useRoutes(routes);
}
