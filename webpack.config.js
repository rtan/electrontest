var path = require("path");

module.exports = [
    {
        mode:
            "development",
        entry:
            "./src/orbi/main/main.ts",
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
        entry: "./src/orbi/renderer/index.tsx",
        output: {
            filename: "renderer.js"
        },
        target: "electron-renderer",
        module:
            {
                rules: [
                    {
                        test: /\.(ts|tsx)$/,
                        use: "ts-loader",
                    },
                    {
                        test: /\.css$/,
                        use: ["style-loader", "css-loader"],
                    },
                    {
                        test: /\.less$/,
                        use: ["style-loader", "css-loader", "less-loader"],
                    },
                    {
                        test: /\.html$/,
                        use: "html-loader",
                    },
                    {
                        test: /\.(jpg|png|gif)$/,
                        use: "url-loader",
                    },
                    {
                        test: /\.(woff|woff2|eot|ttf|svg)$/,
                        loader: 'file-loader',
                    }
                ]
            },
        resolve: {
            extensions: [".ts", ".tsx", ".js", ".css", ".html", ".less", ".gif"],
            alias: {
                orbi: path.resolve(__dirname, './src/orbi')
            }
        }
    }
]
;