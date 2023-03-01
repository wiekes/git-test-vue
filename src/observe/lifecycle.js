import { createElementVNode, createTextVNode } from "../vdom";
import Watcher from "./watcher";

function createElm(vnode) {
    let { tag, data, children, text } = vnode;
    if (typeof tag === 'string') {  // 标签
        vnode.el = document.createElement(tag); // 这里将真实节点和虚拟节点对应起来，后续如果修改属性  就可以通过虚拟节点找到真实节点修改

        patchProps(vnode.el, data);

        children.forEach(child => {   // 数据递归
            vnode.el.appendChild(createElm(child))
        });
    } else {
        vnode.el = document.createTextNode(text);
    }
    return vnode.el
}

// 更新属性
function patchProps(el, props) {
    for (let key in props) {
        if (key === 'style') {
            for (let styleName in props.style) {
                el.style[styleName] = props.style[styleName];
            }
        } else {
            el.setAttribute(key, props[key])
        }
    }
}


function patch(oldVNode, vnode) {
    // 初始化渲染流程
    // debugger

    const isRealElement = oldVNode.nodeType;   // .nodeType原生方法
    // console.log(oldVNode, vnode);
    if (isRealElement) {
        const elm = oldVNode;  // 获取真实元素
        // console.log(elm);
        const parentElm = elm.parentNode; // 拿到父元素
        // console.log(parentElm);
        let newElm = createElm(vnode);
        // console.log('new',newElm);

        parentElm.insertBefore(newElm, elm.nextSibling);  // 插入后删除
        parentElm.removeChild(elm); // 删除老节点
        return newElm
    } else {
        // diff算法
    }
}

export function initLifeCycle(Vue) {
    Vue.prototype._update = function (vnode) {  // 将vnode 转化成真是dom
        const vm = this;
        const el = vm.$el;

        // patch既有初始化的功能 又有更新
        // patch(el, vnode);
        vm.$el = patch(el,vnode)
    }

    // _c('div',{},...children)
    Vue.prototype._c = function () {
        return createElementVNode(this, ...arguments)

    }
    // _v(text)
    Vue.prototype._v = function () {
        return createTextVNode(this, ...arguments)
    }

    Vue.prototype._s = function (value) {
        // debugger
        if (typeof value !== 'object') return value;
        return JSON.stringify(value)
    }
    Vue.prototype._render = function () {

        // 当渲染的时候会去实例中取值，找到就可以将属性和试图绑定在一起

        // console.log('render');
        const vm = this;
        // 让with中的this指向vm
        // debugger
        // console.log(); 
        return vm.$options.render.call(vm); // 通过ast语法转义后生成的render方法

    }
}

export function mountComponent(vm,el) {  // 这里的el是通过querySelector处理过的 options里的el是没处理过的

    vm.$el = el;

    // 1.调用render方法产生虚拟节点 虚拟DOM
    // debugger

    const updateComponent = () =>{
        vm._update(vm._render());  // vm.$options.render()  虚拟节点
    }
    
    const watcher = new Watcher(vm,updateComponent,true); // true用于表识是一个渲染watcher
    // console.log(watcher);
    // 2.根据虚拟DOM产生真实DOM

    // 3.插入到el元素中
}


// vue核心流程 1） 创造了响应式数据 2） 模板转换成ast语法树
// 3） 将ast语法树转换了render函数  4） 后续每次数据更新可以只执行render函数 （无需再次执行ast转化的过程）

// render函数会产生虚拟节点 （使用响应式数据）
// 根据生成的虚拟节点创造真实的DOM

export function callHook(vm,hook){
    const handlers = vm.$options[hook];
    if(handlers){
        handlers.forEach(handler=>{handler.call(vm)})
    }
}