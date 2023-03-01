const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`;
const qnameCapture = `((?:${ncname}\\:)?${ncname})`;
const startTagOpen = new RegExp(`^<${qnameCapture}`); // 他配置到的分组是一个 标签名 <xxx 匹配到开始标签的名字
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`); // 匹配的是 </xxx> 最终匹配到的分组就是结束背签的名字
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;  // 匹配属性
// 第一个分组就是属性的key value 就是 分组3.分组4/分组5
const startTagClose = /^\s*(\/?)>/;  // <div> <br/>
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g;  // {{ dddd}} 匹配到的内容就是我们表达式的变量

// vue3 采用的不是正则

// 对模板进行编译处理



export function parseHTML(html) {

    let ElEMENT_TYPE = 1;
    let TEXT_TYPE = 3;
    let stack = []; // 用于存放元素
    let currentParent; // 指向的是栈中的最后一个
    let root;
    // 最终转化成一个抽象语法树

    function createASTElement(tag, attrs) {
        return {
            tag,
            type: ElEMENT_TYPE,
            children: [],
            attrs,
            parent: null
        }
    }
    function start(tag, attrs) {
        let node = createASTElement(tag, attrs);
        if (!root) { // 看一下是否是空树
            root = node  // 如果为空则当前是树的根节点
        }
        if (currentParent) {
            node.parent = currentParent; // 值赋予了parent属性
            currentParent.children.push(node); // 还需要让父亲记住自己
        }
        stack.push(node);
        currentParent = node;  // currentParent为栈中的最后一个

    }
    function chars(text) {  // 文本直接放到当前指向的节点中
        text = text.replace(/\s/g, '');
        text && currentParent.children.push({
            type: TEXT_TYPE,
            text,
            parent: currentParent
        });
        // console.log(text, '文本');
    }
    function end(tag) {
        let node = stack.pop(); // 弹出最后一个，校验标签是否合法
        currentParent = stack[stack.length - 1]
        // console.log(tag, '结束');
    }

    function advance(n) {
        html = html.substring(n);
    }
    function parseStartTag() {
        const start = html.match(startTagOpen)
        if (start) {
            const match = {
                tagName: start[1], // 标签名
                attrs: []
            }
            advance(start[0].length)

            // 如果不是开始标签就一直匹配下去
            let attr, end;
            while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
                advance(attr[0].length);
                match.attrs.push({ name: attr[1], value: attr[3] || attr[4] || attr[5] || true })

            }

            if (end) {
                advance(end[0].length)
            }
            return match;
        }
        // console.log(html);
        return false;  // 不是开始标签
    }
    while (html) {
        // 如果textEnd 为0 说明是一个开始标签或者结束标签
        // 如果textEnd >0 说明就是文本的结束位置
        let textEnd = html.indexOf('<'); // 如果indexOf中索引是0 则说明是个标签

        if (textEnd == 0) {
            const startTagMatch = parseStartTag();  // 开始标签的匹配结果

            if (startTagMatch) {  // 解析到开始标签
                // console.log(startTagMatch);
                // console.log(html);
                start(startTagMatch.tagName, startTagMatch.attrs)
                continue
                // break
            }
            let endTagMatch = html.match(endTag);
            if (endTagMatch) {
                advance(endTagMatch[0].length);
                end(endTagMatch[0])
                continue
            }

        }

        if (textEnd > 0) {
            let text = html.substring(0, textEnd); //本文内容
            if (text) {
                // console.log("text",text);
                chars(text)
                advance(text.length);   // 解析到的文本

                // console.log(html);
            }
        }

    }
    // console.log(html, 'html end');
    // console.log(root);
    return root;
}