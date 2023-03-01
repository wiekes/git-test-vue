// 重新数组的部分方法


let oldArrayProto = Array.prototype; // 获取数组的原型

// newArrayProto.__proto__ = oldArrayProto
export let newArrayProto = Object.create(oldArrayProto);

let methods = [  // 找到所有变异方法
    'push',
    'pop',
    'shift',
    'unshift',
    'reverse',
    'sort',
    'splice'
]  // concat slice 都不会改变原数组 只有上面七个方法会改变数组

methods.forEach(method => {
    newArrayProto[method] = function (...args) {  // 这里重新数组方法

        const result = oldArrayProto[method].call(this, ...args);  // 内部调用原来的方法，函数的劫持 切片编程
        // console.log("method", method);

        // 我们需要对新增的 数据再次进行劫持
        let inserted;
        let ob = this.__ob__;
        switch (method) {
            case 'push':
            case 'unshift':   // arr.unshift(1,2,3)
                inserted = args;
                break;
            case 'splice': // arr.splice(0,1,{a:1},{a:1})
                inserted = args.slice(2)
            default:
                break;
        }
        if(inserted){
            ob.observeArray(inserted);
        }

        ob.dep.notify(); // 数组变化了通知对应的watcher实现更新逻辑
        return result
    }
})
