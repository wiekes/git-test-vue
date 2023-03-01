import { newArrayProto } from "./array";
import Dep from "./dep";

class Observer {
    constructor(data) {

        // 给每个对象对增加收集功能
        this.dep = new Dep(); // 所有对象都要增加dep


        // Object.defineProperty只能劫持已经存在的属性，后增的或者删除的不知道 （vue里面会为此单独写一些api $set $delete）
        
        Object.defineProperty(data, '__ob__',{
            value:this,
            enumerable:false  // 将__ob__变成不可枚举 （循环的时候无法获取到）
        })

        // data.__ob__ = this // 数据加了一个__ob__则说明这个属性被观测过了

        if (Array.isArray(data)) {
            // 这里我们可以重写数组中的方法 7个变异方法 是可以修改数组本身

            // data.__proto__ = ?  直接重写会导致数组原有的方法 丢失 需要保留数组原有的特性，并且可以重新部分方法

            data.__proto__ = newArrayProto // 需要保留数组原有特性，并且可以重写部分方法

            this.observeArray(data);  // 数组中的存放对象 可以监控到对象的变化
        } else {
            this.walk(data);
        }

    }
    walk(data) {  // 循环对象 对属性依次劫持

        // ”重新定义“属性  性能差
        Object.keys(data).forEach(key => defineReactive(data, key, data[key]))  // 将属性变为响应   定义成响应式  
    }
    observeArray(data) {  // 观测数组
        data.forEach(item =>{
            observe(item)
        })
    }
}

// 深层次嵌套会递归,递归多了性能差,不存在的属性监控不到,存在的属性要重写方法 vue3-> proxy
function dependArray(value){
    for(let i=0;i<value.length;i++){
        let current = value[i];
        current.__ob__ && current.__ob__.dep.depend();
        if(Array.isArray(current)){
            dependArray(current);
        }
    }
}

// 方法可单独使用 后面可以导出使用 所以不是 直接写在Observer类里面

export function defineReactive(target, key, value) {   // 闭包 属性劫持
    // childOb.dep 用来收集依赖的
    let childOb = observe(value); // 对所有的对象都进行属性劫持   递归的形式  只是对对象进行迭代劫持 数组没有
    let dep = new Dep();  // 每个属性都有一个dep
    // Object.defineProperty() 使用的是 defineReactive 的变量 即使用了外部数据 所以外不的数据 变量不能够被销毁  相当于形成闭包
    // 不被销毁是因为，get set监听事件是全局事件，不被销毁，内部函数保存着外部函数的作用域，所以外部函数有引用，也不会被销毁。coderwhy
    Object.defineProperty(target, key, {
        get() {   // 取值的时候 会执行get
            // console.log('key', key);

            if(Dep.target){
                dep.depend();  // 让这个属性的收集器记住当前，的watcher
                if(childOb){
                    childOb.dep.depend(); // 让数组和对象本身也实现依赖收集

                    if(Array.isArray(value)){
                        dependArray(value)
                    }
                }
            }

            return value
        },
        set(newValue) {   // 修改的时候 会执行
            if (newValue === value) return  // 做判断减少性能损耗  赋值性能损耗大
            observe(newValue)    // 修改后继续劫持
            value = newValue
            dep.notify(); // 通知更新
        }
    })
}


export function observe(data) {
    // 对这个对象进行劫持
    if (typeof data !== "object" || data == null) {  // 如果是函数在state.js已经将this指向实例对象了   或语句 
        return; // 只对对象进行劫持
    }
    if(data.__ob__ instanceof Observer){    // 说明这个对象已经被代理过了
        return data.__ob__;
    }
    // 如果一个对象劫持过了，那就不需要再被劫持了 （要判断一个对象是否被劫持过，可以添加一个实例，用实例来判断是否被劫持过）

    return new Observer(data);
}