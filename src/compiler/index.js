import { parseHTML } from "./parse"


function genProps(attrs) {
    let str = '' // {name, value}
    for (let i = 0; i < attrs.length; i++) {
        let attr = attrs[i];
        if (attr.name === 'style') {
            // color:red;background:red => {color:'red'}
            let obj = {};
            attr.value.split(';').forEach(item => {
                let [key, value] = item.split(':');
                obj[key] = value
            });
            attr.value = obj
        }

        str += `${attr.name}:${JSON.stringify(attr.value)},`   // a:b,c:d
    }
    return `{${str.slice(0, -1)}}`
}

// 可能是文本也可能是元素
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g;  // {{ dddd}} 匹配到的内容就是我们表达式的变量
function gen(node) {
    if (node.type === 1) {
        // 元素
        return codegen(node);
    } else {
        // 文本
        let text = node.text;
        // console.log(defaultTagRE.test(text));
        if (!defaultTagRE.test(text)) {
            // 不含变量的情况 {{name}}
            return `_v(${JSON.stringify(text)})`
        } else {
            // 含变量的情况
            // _v(_s(name)+'hello'+_s(name))
            let tokens = [];
            let match;
            defaultTagRE.lastIndex = 0;
            let lastIndex = 0
            while (match = defaultTagRE.exec(text)) {
                // console.log(match,'ooooooo');
                let index = match.index;  // 匹配的位置
                // console.log(index, 'dd');
                if (index > lastIndex) {
                    tokens.push(JSON.stringify(text.slice(lastIndex, index)))
                }
                tokens.push(`_s(${match[1].trim()})`)  // trim 去空格
                lastIndex = index + match[0].length
            }
            if (lastIndex < text.length) {
                tokens.push(JSON.stringify(text.slice(lastIndex)));
            }
            // console.log(tokens);
            return `_v(${tokens.join('+')})`
        }
        // console.log(node);
    }
}

function genChildren(children) {
    return children.map(child => gen(child)).join(',');
}

function codegen(ast) {
    let children = genChildren(ast.children)
    let code = (`_c('${ast.tag}',${ast.attrs.length > 0 ? genProps(ast.attrs) : 'null'}${ast.children.length ? `,${children}` : ''})`)

    return code
}

export function compileToFunction(template) {

    // 1.就是将template 转化成ast语法树
    let ast = parseHTML(template)
    // 2.生成render方法 (render方法执行后的返回的结果就是 虚拟DOM)
    // console.log(template);
    // console.log(ast);

    // console.log(codegen(ast));

    // 模板引擎的实现原理 就是 with + new Function

    let code = codegen(ast);
    // console.log(code);
    code = `with(this){return ${code}}`;
    // 使用with() 将对象属性直接变成with作用域下的变量
    let render = new Function(code); // 根据代码生成render函数
    // console.log(render.toString());
    
    return render;
}