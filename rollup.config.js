import babel from 'rollup-plugin-babel'
import resolve from '@rollup/plugin-node-resolve'

// rollup默认可以导出一个对象 作为打包的配置文件
export default {
    input: './src/index.js', // 入口
    output: {
        file: './dist/vue.js',  // 出口
        name: 'Vue',  //global.Vue  node.js环境下的全局对象 相当于浏览器端browser的window
        format: 'umd',  // esm es6模块 commmon.js模块 iife自执行函数   umd支持（commonjs amd）
        sourcemap: true  // 可以调试代码
    },
    plugins:[
        babel({
            exclude: 'node_modules/**'  // 排除node_modules所有文件都是第三方模块不需打包
        }),   // 所以插件都是函数
        resolve()
    ]
}

// 为什仫vue2 只能支持车以上 Object.defineProperty不支持低版本的
// proxy是 ie6的 也没有替代方案
