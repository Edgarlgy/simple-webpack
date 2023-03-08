const fs = require("fs");
const path = require("path");
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const { transformFromAst } = require("@babel/core");

module.exports = {
    // 获取抽象语法树
    getAst: function (path) {
        const content = fs.readFileSync(path, "utf-8");
        return parser.parse(content, {
            sourceType: "module",
        })
    },
    // 获取依赖
    getDependencies: function (ast, filename) {
        // 创建一个对象用于存储依赖，最终返回这个对象
        const dependencies = {};
        // 遍历所有的 import 模块,存入dependencies
        traverse(ast, {
            // 类型为 ImportDeclaration 的 AST 节点 (即为import 语句)
            ImportDeclaration({ node }) {
                const dirname = path.dirname(filename);
                // 保存依赖模块路径,之后生成依赖关系图需要用到
                const filepath = "./" + path.join(dirname, node.source.value);
                console.log(666, filepath)
                dependencies[node.source.value] = filepath;
            }
        })
        return dependencies
    },
    // 获取代码
    getCode: function (ast) {
        // AST 转换为 code
        const { code } = transformFromAst(ast, null, {
            presets: ["@babel/preset-env"],
        });
        return code
    }

}

