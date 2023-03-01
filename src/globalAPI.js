import { mergeOptions } from "./utils";


export function initGlobalAPI(Vue) {
    
    Vue.options = {};
    
    Vue.mixin = function (mixin) {
        // 我们期待囧用户的选项 和全局的options进行合并

        // {} {created:function(){}}  => {creeated:[fn]}  第一次用空的{}的对象 和 用户传入的created:function进行混合

        // {created:[fn]}  {created:function(){}} => {created:[fn,fn]  第二次也是将用户第二次传入的与前一次混合的与这一次的加入的混合
        this.options = mergeOptions(this.options, mixin)
        return this;
    }

}