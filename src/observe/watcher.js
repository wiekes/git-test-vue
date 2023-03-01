import Dep, { popTarget, pushTarget } from "./dep";

let id = 0;

// 组件优点  复用 维护简单 局部更新

// 1) 当前我们创建渲染watcher的时候会把当前的渲染watcher放在Dep.target上
// 2） 调用_render() 会取值 走get

// 每个属性有一个dep (属性就是悲观者)， watcher就是观察者（属性变化了就会通知观察者来更新）  -> 观察者模式

class Watcher {  // 不同组件有不同的watcher 目前只有一个 渲染实例的
    constructor(vm, exprOrFn, options,cb) {
        this.id = id++;
        this.renderWatcher = options;  // 是一个渲染watcher

        if(typeof exprOrFn === 'string'){
            this.getter = function(){
                return vm[exprOrFn]
            }
        }else{
            this.getter = exprOrFn; // getter意味着调用这个函数可以发生取值操作
        }

        this.deps = [];  // 组件卸载   后续实现计算属性，和一些清理工作需要用到
        this.depsId = new Set();
        this.cb = cb;
        this.lazy = options.lazy;
        this.dirty = this.lazy;  // 缓存值
        this.vm = vm;

        this.user = options.user; // 标识是否是用户自己的watcher

        this.value = this.lazy ? undefined : this.get();

    }

    addDep(dep) {  // 一个组件即一个视图 对应着多个属性 重复的属性也不用记录
        let id = dep.id;
        if (!this.depsId.has(id)) {
            this.deps.push(dep);
            this.depsId.add(id);
            dep.addSub(this); // watcher已经记住了dep了而且已经去重了， 此时让dep也记住watcher
        }
    }

    evaluate(){
        // debugger
        this.value = this.get(); // 获取到用户函数的的返回值 并且还标识为脏
        this.dirty = false;
    }

    get() {
        pushTarget(this)  // 静态属性就是只有一份
        let value = this.getter.call(this.vm);  // 会去vm上取值  vm.update(vm._render())
        popTarget() // 渲染完毕就清空   单线程 先挂载使用后 清空
        return value
    }

    depend(){ // watcher 的depend 就是让watcher的dep去调用depend()
        let i = this.deps.length;

        while(i--){
            // dep.depand()
            this.deps[i].depend(); // 让计算属性watcher 也收集渲染watcher  dep里面的depend
        }
    }
    update() {
        // console.log('update');
        if(this.lazy){
            // 如果是计算属性 依赖的值发生变化 就标识计算属性是脏值
            this.dirty = true;
        }else{
            queueWatcher(this);  // 把当前的watcher 暂存起来
            // this.get(); // 重新渲染
        }
        
    }
    run() {
        // console.log('run');
        let oldValue = this.value;
        let newValue = this.get();
        if(this.user){
            this.cb.call(this.vm,newValue,oldValue);
        }
    }
}

let queue = [];
let has = {};
let pending = false;  // 防抖

function flushSchedulerQueue() {
    let flushQueue = queue.slice(0);
    queue = [];
    has = {};
    pending = false;   // 一轮改变之后的恢复
    flushQueue.forEach(q => q.run());  // 在刷新的过程中可能还有新的watcher,重新放到queue中
}

function queueWatcher(watcher) {
    const id = watcher.id;
    if (!has[id]) {
        queue.push(watcher);
        has[id] = true;
        // 不管我们的update执行多少次，但是最终只执行一轮刷新操作
        if (!pending) {
            nextTick(flushSchedulerQueue)
            pending = true;
        }
    }
}

// 使用队列将多次执行合并成一次 变量 开个异步   变成批处理
let callbacks = [];
let waiting = false;
function flushCallbacks() {
    let cbs = callbacks.slice(0);    // 代码先写 声明变量 之后赋值 再函数操作
    // console.log(123,vm.name);
    // console.log(app.innerHTML);
    waiting = true;
    callbacks = [];
    cbs.forEach(cb => cb());    // 按照顺序依次执行
}

// nextTick 没有直接使用某个api而是采用优雅降级的方式
// 内部先采用的是promise (ie不兼容)  MutationObserver(h5的api) 可以考虑ie专享的 setImmediate setTimeout

// let timerFunc;

// if (Promise) {
//     timerFunc = () => {
//         Promise.resolve().then(flushCallbacks)
//         console.log(1);
//     }
// } else if (MutationObserver) {
//     let observer = new MutationObserver(flushCallbacks); // 这里传入的是回调是异步执行的
//     let textNode = document.createTextNode(1);
//     observer.observe(textNode, {
//         CharacterData: true
//     });
//     timerFunc = () => {
//         textNode.textContent = 2;
//     }
// } else if (setImmediate) {
//     timerFunc = () => {
//         setImmediate(flushCallbacks);
//     }
// } else {
//     timerFunc = () => {
//         setTimeout(flushCallbacks);
//     }
// }

export function nextTick(cb) {
    callbacks.push(cb);
    if (!waiting) {
        // setTimeout(() => {
        //     flushCallbacks();  // 最后一起刷新
        // }, 0)
        // timerFunc();
        Promise.resolve().then(flushCallbacks);
        waiting = true;
    }
}

// 需要给每个属性增加一个dep，目的就是收集watcher

// 一个视图中 有多少个属性 （n个属性会对应一个视图）n个dep对应一个watcher
// 1个视图 对应着多个视图      一个视图就是一个组件
// 多对多的关系

export default Watcher