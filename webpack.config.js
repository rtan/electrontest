module.exports = [
    {
        mode:
            "development",
        entry:
            "./src/main/main.ts",
        target:
            "electron-main",
        module:
            {
                rules: [
                    {
                        test: /\.ts$/,
                        use: "ts-loader"
                    }
                ]
            }
        ,
        resolve: {
            extensions: [".ts", ".js"]
        }
    },
    {
        mode: "development",
        entry: "./src/renderer/index.ts",
        output: {
            filename: "renderer.js"
        },
        target: "electron-renderer",
        module:
            {
                rules: [
                    {
                        test: /\.ts$/,
                        use: "ts-loader",
                    },
                    {
                        test: /\.css$/,
                        use: ["style-loader", "css-loader"],
                    },
                    {
                        test: /\.html$/,
                        use: "html-loader",
                    }
                ]
            },
        resolve: {
            extensions: [".ts", ".js", ".css", ".html"]
        }
    }
]
;