import { compileToFunction } from "./compiler";
import { callHook, mountComponent } from "./observe/lifecycle";
import { initState } from "./state";
import { mergeOptions } from "./utils";

export function initMixin(Vue) {  // 就是给Vue增加init方法的
    Vue.prototype._init = function (options) {  // 用于初始化操作
        // vue vm.$options 就是获取用户的配置

        // 我们使用 vue的时候 $nextTick $data $attr.... 其实就是区分vue的自己的属性
        const vm = this;  // Vue

        // 我们定义的全局指令和过滤器.... 都会挂载到实例上
        vm.$options = mergeOptions(this.constructor.options,options); // 将用户的选项挂载到实例上 this是实例this.constructor 就是Vue.options 就是全局的options


        callHook(vm,'beforeCreate');
        // 初始化状态，初始化属性，watcher
        // 数据的初始化对用户的数据的处理  
        initState(vm);

        callHook(vm,'created');

        if (options.el) {
            vm.$mount(options.el);  // 实现数据的挂载
        }
    }
    Vue.prototype.$mount = function (el) {
        const vm = this;
        el = document.querySelector(el);
        // vm.$el = el
        let ops = vm.$options

        if (!ops.render) {   // 先进行查找有没有renderh函数
            let template;  // 没有render看一下是否写了template, 没有template采用外部的template
            if (!ops.template && el) {   // 没有写模板 但写了el
                template = el.outerHTML;
            } else {
                if (el) {
                    template = ops.template
                }
            }
            // 写了template 就用 写的template
            if (template) {
                // 这里需要对模板进行编译
                // console.log(template);
                const render = compileToFunction(template);
                // console.log(render);
                ops.render = render;
            }
        }
        // console.log( ops.render); // 最终就可以获取的render方法
        mountComponent(vm, el); // 组件的挂载
        // script 标签引用的vue.global.js 这个编译过程式在浏览器运行的
        // runtime是不包含模板编译的，整个编译是打包的时候通过loader来转义.vue文件的，用runtime的时候不能使用template
    }
}
