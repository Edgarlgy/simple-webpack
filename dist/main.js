(function(graph) {
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
            require('./src/index.js')
        })({"./src/index.js":{"dependencies":{"hello.js":"./src\\hello.js"},"code":"\"use strict\";\n\nvar _hello = require(\"hello.js\");\ndocument.write((0, _hello.say)(\"webpack\"));"},"./src\\hello.js":{"dependencies":{"./tool1.js":"./src\\tool1.js","./tool2.js":"./src\\tool2.js"},"code":"\"use strict\";\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nexports.say = say;\nvar _tool = require(\"./tool1.js\");\nvar _tool2 = require(\"./tool2.js\");\nfunction say(name) {\n  var num = (0, _tool.randomNum)(1, 100);\n  (0, _tool2.printTxt)(num);\n  return \"hello\".concat(name);\n}"},"./src\\tool1.js":{"dependencies":{},"code":"\"use strict\";\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nexports.randomNum = randomNum;\nfunction randomNum(min, max) {\n  return Math.floor(Math.random() * (max - min + 1) + min);\n}"},"./src\\tool2.js":{"dependencies":{},"code":"\"use strict\";\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nexports.printTxt = printTxt;\nfunction printTxt(txt) {\n  console.log(txt);\n}"}})