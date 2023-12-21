import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: [
            { find: /^~/, replacement: "" },
            { find: "@", replacement: path.resolve(__dirname, "./src ") },
        ],
    },
    css: {
        preprocessorOptions: {
            less: {
                math: "always", // 括号内才使用数学计算
                javascriptEnabled: true,
                globalVars: {
                    // 全局变量
                    mainColor: "red",
                },
            },
        },
    },
});
