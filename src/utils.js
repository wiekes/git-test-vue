// 静态方法
const strats = {};
const LIFECYCLE = [
    'beforeCreate',
    'created'
];
LIFECYCLE.forEach(hook => {
    strats[hook] = function (p, c) {
        if (c) {  // 如果儿子 有 父亲有 让父亲和儿子拼在一起
            if (p) {
                return p.concat(c)
            } else {
                return [c]; // 儿子有父亲没有,则将儿子包装成数组
            }
        } else {
            return p; // 如果儿子没有则用父亲即可
        }
    }
})
export function mergeOptions(parent, child) {

    const options = {};
    // const options = {...parent,..child}; 过于暴力 而且覆盖
    for (let key in parent) {   // 循环老的
        mergeField(key);
    }
    for (let key in child) {  // 循环新的
        if (!parent.hasOwnProperty(key)) {
            mergeField(key);
        }
    }
    function mergeField(key) {
        // 策略模式 用策略模式减少if / else
        if (strats[key]) {
            options[key] = strats[key](parent[key], child[key])
        } else {
            // 如果不再策略中则以儿子为主
            options[key] = child[key] || parent[key]; // 优先采用儿子,再采用父亲
        }
    }
    return options;
}
