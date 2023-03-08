const fs = require("fs");
const path = require("path");
const parser = require("./parser");

class Compiler {
    constructor(options) {
        this.entry = options.entry; // 实例属性entry存储用户配置的entry信息
        this.output = options.output; // 实例属性output存储用户配置的output信息
        this.modules = []; // 存储模块
    }
    // 启动构建
    run() {
        // 调用实例方法 build，将入口路径传递过去
        const info = this.build(this.entry);
        this.modules.push(info); // 此对象作为一个模块存储到 modules 数组中
        // 接下来我们需要找到所有的依赖
        for (let i = 0; i < this.modules.length; i++) {
            let obj = this.modules[i];
            // 查看当前的模块是否还有依赖
            if (obj.dependencies && this.modules.indexOf(obj.filename) === -1) {
                for (const dependency in obj.dependencies) {
                    // 重复之前的行为，得到模块信息对象后推入 modules 数组
                    this.modules.push(this.build(obj.dependencies[dependency]));
                }
            }
        }
        // 代码运行到这一步，modules 数组里面存放了所有依赖模块的信息对象
        // 接下来我们来生成依赖图
        // 这里涉及到了数组 reduce 的基本用法，graph 代表前一项，item 代表当前项
        const dependencyGraph = this.modules.reduce((graph, item) => ({
            ...graph,
            [item.filename]: {
                dependencies: item.dependencies,
                code: item.code,
            }
        }), {});
        // 所生成的 dependencyGraph 实际上就是一个对象
        // 对象的键名为模块路径，对象值为 dependencies 和 code 组成的对象
        // 接下来我们来生成代码
        this.generate(dependencyGraph);
    }
    // 构建模块对象
    build(filename) {
        const { getAst, getDependencies: getDependencies, getCode } = parser;
        // 获取抽象语法树
        const ast = getAst(filename);
        // 获取依赖文件
        const dependencies = getDependencies(ast, filename);
        // 获取依赖文件对应的代码
        const code = getCode(ast);
        // 返回解析过后的内容对象
        // 里面包含文件路径、依赖以及代码
        return {
            filename,
            dependencies,
            code,
        }
    }
    // 生成对应代码
    generate(code) {
        // 该方法的基本思路就是先获取用户配置的打包文件存放路径，生成一个 bundle 字符串，最后将这个字符串写入文件。
        // 生成用户配置的打包文件存放路径
        const filePath = path.join(this.output.path, this.output.filename);
        const bundle = `(function(graph) {
            function require(moduleId) {
                function localRequire(relativePath) {
                    return require(graph[moduleId].dependencies[relativePath])
                }
                var exports = {};
                (function(require, exports, code) {
                    eval(code)
                })(localRequire, exports, graph[moduleId].code);
                return exports
            }
            require('${this.entry}')
        })(${JSON.stringify(code)})`;
        // 最后将生成的 bundle 写入文件
        fs.writeFileSync(filePath, bundle);
    }
}

module.exports = Compiler;
