import { initGlobalAPI } from "./globalAPI";
import { initMixin } from "./init"
import { initLifeCycle } from "./observe/lifecycle";
import { initStateMixin } from "./state";

// 模块化开发使用构造函数 而不是 class类

//  将所有的方法都耦合在一起
function Vue(options) {
    this._init(options)
}

initMixin(Vue);  // 扩展init方法
initLifeCycle(Vue); // vm._update vm._render


initGlobalAPI(Vue); // 全局api的实现

initStateMixin(Vue); // 实现nextTick $watch

// ---------------------------------------------




export default Vue