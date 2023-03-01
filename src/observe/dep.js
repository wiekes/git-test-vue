
let id = 0;

class Dep {
    constructor() {
        this.id = id++;  // 属性的dep要收集watcher
        this.subs = []; // 这里存放着当前，属性对应的watcher有哪些
    }

    depend() {
        // 这里不希望放置重复的watcher，而且刚才只是一个单向的关系 dep => watcher
        // watcher 记录dep
        // this.subs.push(Dep.target);

        Dep.target.addDep(this);  // 让watcher 记住dep

        // dep 和 watcher 是一个多对多的关系 （一个属性可以在多个组件中使用 dep -> 多个watcher）
        // 一个组件中由多个属性组成 （一个watcher 对应多个dep）
    }
    addSub(watcher) {

        this.subs.push(watcher); // 有计算属性watcher现存 其次是渲染watcher  先执行计算属性watcher 在执行渲染属性watcher
    }
    notify() {
        this.subs.forEach(watcher => {
            watcher.update()
            // console.log(watcher);
        }); // 告诉watcher要更新了
    }
}


// 计算属性computed的队列   

// 第一的watcher是渲染是触发的 进入 
// 第二次是因为第一次渲染的取值操作触发的计算computed watcher
// data. 属性记录的是计算属性的watcher而不是渲染属性的watcher因为直接渲染没有调用data的属性没有触发get => dep.depend() 所有dep.subs没记录 

Dep.target = null;

let stack = [];

export function pushTarget(watcher) {
    stack.push(watcher);
    Dep.target = watcher;
}

export function popTarget() {
    stack.pop();
    Dep.target = stack[stack.length - 1];
}

export default Dep;
