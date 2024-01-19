import { BrowserRouter, Routes, Link, useNavigate, Route, Outlet, useParams } from "../../watch-router";



export default function RouteComponent(props) {
    return <div className="app"><BrowserRouter>
        <Routes>
            <Route path="/" element={<Layout />}>
                <Route path="/" element={<Home />} />
                {/* <Route path="product" element={<Product />} /> */}
                <Route path="product" element={<Product />}>
                    <Route path=":id" element={<ProductDetail />} />
                </Route>
                {/* <Route path="*" element={<NoMatch />} /> */}
            </Route>
        </Routes>
    </BrowserRouter></div>;
}
function Layout() {
    return (
        <div>
            <Link to="/">首页</Link>
            <Link to="product">商品</Link>
            <Outlet />
        </div>
    );
}
function Home() {
    return <div><h1>Home</h1></div>;
}

function Product() {
    // const path = useResolvedPath("123");
    // console.log("path", path); //sy-log
    return (
        <div>
            <h1>Product</h1>
            <Link to="123">详情</Link>
            {/* <Outlet /> */}
        </div>
    );
}
function ProductDetail() {
    const params = useParams();
    const navigate = useNavigate();
    return (
        <div>
            <h1>ProductDetail: {params.id}</h1>
            <button
                onClick={() => {
                    navigate("/");
                }}
            >
                go home
            </button>
        </div>
    );
}