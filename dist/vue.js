(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

    // 静态方法
    var strats = {};
    var LIFECYCLE = ['beforeCreate', 'created'];
    LIFECYCLE.forEach(function (hook) {
      strats[hook] = function (p, c) {
        if (c) {
          // 如果儿子 有 父亲有 让父亲和儿子拼在一起
          if (p) {
            return p.concat(c);
          } else {
            return [c]; // 儿子有父亲没有,则将儿子包装成数组
          }
        } else {
          return p; // 如果儿子没有则用父亲即可
        }
      };
    });

    function mergeOptions(parent, child) {
      var options = {};
      // const options = {...parent,..child}; 过于暴力 而且覆盖
      for (var key in parent) {
        // 循环老的
        mergeField(key);
      }
      for (var _key in child) {
        // 循环新的
        if (!parent.hasOwnProperty(_key)) {
          mergeField(_key);
        }
      }
      function mergeField(key) {
        // 策略模式 用策略模式减少if / else
        if (strats[key]) {
          options[key] = strats[key](parent[key], child[key]);
        } else {
          // 如果不再策略中则以儿子为主
          options[key] = child[key] || parent[key]; // 优先采用儿子,再采用父亲
        }
      }

      return options;
    }

    function initGlobalAPI(Vue) {
      Vue.options = {};
      Vue.mixin = function (mixin) {
        // 我们期待囧用户的选项 和全局的options进行合并

        // {} {created:function(){}}  => {creeated:[fn]}  第一次用空的{}的对象 和 用户传入的created:function进行混合

        // {created:[fn]}  {created:function(){}} => {created:[fn,fn]  第二次也是将用户第二次传入的与前一次混合的与这一次的加入的混合
        this.options = mergeOptions(this.options, mixin);
        return this;
      };
    }

    function _iterableToArrayLimit(arr, i) {
      var _i = null == arr ? null : "undefined" != typeof Symbol && arr[Symbol.iterator] || arr["@@iterator"];
      if (null != _i) {
        var _s,
          _e,
          _x,
          _r,
          _arr = [],
          _n = !0,
          _d = !1;
        try {
          if (_x = (_i = _i.call(arr)).next, 0 === i) {
            if (Object(_i) !== _i) return;
            _n = !1;
          } else for (; !(_n = (_s = _x.call(_i)).done) && (_arr.push(_s.value), _arr.length !== i); _n = !0);
        } catch (err) {
          _d = !0, _e = err;
        } finally {
          try {
            if (!_n && null != _i.return && (_r = _i.return(), Object(_r) !== _r)) return;
          } finally {
            if (_d) throw _e;
          }
        }
        return _arr;
      }
    }
    function _typeof(obj) {
      "@babel/helpers - typeof";

      return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
        return typeof obj;
      } : function (obj) {
        return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      }, _typeof(obj);
    }
    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    }
    function _defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor);
      }
    }
    function _createClass(Constructor, protoProps, staticProps) {
      if (protoProps) _defineProperties(Constructor.prototype, protoProps);
      if (staticProps) _defineProperties(Constructor, staticProps);
      Object.defineProperty(Constructor, "prototype", {
        writable: false
      });
      return Constructor;
    }
    function _slicedToArray(arr, i) {
      return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
    }
    function _arrayWithHoles(arr) {
      if (Array.isArray(arr)) return arr;
    }
    function _unsupportedIterableToArray(o, minLen) {
      if (!o) return;
      if (typeof o === "string") return _arrayLikeToArray(o, minLen);
      var n = Object.prototype.toString.call(o).slice(8, -1);
      if (n === "Object" && o.constructor) n = o.constructor.name;
      if (n === "Map" || n === "Set") return Array.from(o);
      if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
    }
    function _arrayLikeToArray(arr, len) {
      if (len == null || len > arr.length) len = arr.length;
      for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
      return arr2;
    }
    function _nonIterableRest() {
      throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }
    function _toPrimitive(input, hint) {
      if (typeof input !== "object" || input === null) return input;
      var prim = input[Symbol.toPrimitive];
      if (prim !== undefined) {
        var res = prim.call(input, hint || "default");
        if (typeof res !== "object") return res;
        throw new TypeError("@@toPrimitive must return a primitive value.");
      }
      return (hint === "string" ? String : Number)(input);
    }
    function _toPropertyKey(arg) {
      var key = _toPrimitive(arg, "string");
      return typeof key === "symbol" ? key : String(key);
    }

    var ncname = "[a-zA-Z_][\\-\\.0-9_a-zA-Z]*";
    var qnameCapture = "((?:".concat(ncname, "\\:)?").concat(ncname, ")");
    var startTagOpen = new RegExp("^<".concat(qnameCapture)); // 他配置到的分组是一个 标签名 <xxx 匹配到开始标签的名字
    var endTag = new RegExp("^<\\/".concat(qnameCapture, "[^>]*>")); // 匹配的是 </xxx> 最终匹配到的分组就是结束背签的名字
    var attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; // 匹配属性
    // 第一个分组就是属性的key value 就是 分组3.分组4/分组5
    var startTagClose = /^\s*(\/?)>/; // <div> <br/>

    // vue3 采用的不是正则

    // 对模板进行编译处理

    function parseHTML(html) {
      var ElEMENT_TYPE = 1;
      var TEXT_TYPE = 3;
      var stack = []; // 用于存放元素
      var currentParent; // 指向的是栈中的最后一个
      var root;
      // 最终转化成一个抽象语法树

      function createASTElement(tag, attrs) {
        return {
          tag: tag,
          type: ElEMENT_TYPE,
          children: [],
          attrs: attrs,
          parent: null
        };
      }
      function start(tag, attrs) {
        var node = createASTElement(tag, attrs);
        if (!root) {
          // 看一下是否是空树
          root = node; // 如果为空则当前是树的根节点
        }

        if (currentParent) {
          node.parent = currentParent; // 值赋予了parent属性
          currentParent.children.push(node); // 还需要让父亲记住自己
        }

        stack.push(node);
        currentParent = node; // currentParent为栈中的最后一个
      }

      function chars(text) {
        // 文本直接放到当前指向的节点中
        text = text.replace(/\s/g, '');
        text && currentParent.children.push({
          type: TEXT_TYPE,
          text: text,
          parent: currentParent
        });
        // console.log(text, '文本');
      }

      function end(tag) {
        stack.pop(); // 弹出最后一个，校验标签是否合法
        currentParent = stack[stack.length - 1];
        // console.log(tag, '结束');
      }

      function advance(n) {
        html = html.substring(n);
      }
      function parseStartTag() {
        var start = html.match(startTagOpen);
        if (start) {
          var match = {
            tagName: start[1],
            // 标签名
            attrs: []
          };
          advance(start[0].length);

          // 如果不是开始标签就一直匹配下去
          var attr, _end;
          while (!(_end = html.match(startTagClose)) && (attr = html.match(attribute))) {
            advance(attr[0].length);
            match.attrs.push({
              name: attr[1],
              value: attr[3] || attr[4] || attr[5] || true
            });
          }
          if (_end) {
            advance(_end[0].length);
          }
          return match;
        }
        // console.log(html);
        return false; // 不是开始标签
      }

      while (html) {
        // 如果textEnd 为0 说明是一个开始标签或者结束标签
        // 如果textEnd >0 说明就是文本的结束位置
        var textEnd = html.indexOf('<'); // 如果indexOf中索引是0 则说明是个标签

        if (textEnd == 0) {
          var startTagMatch = parseStartTag(); // 开始标签的匹配结果

          if (startTagMatch) {
            // 解析到开始标签
            // console.log(startTagMatch);
            // console.log(html);
            start(startTagMatch.tagName, startTagMatch.attrs);
            continue;
            // break
          }

          var endTagMatch = html.match(endTag);
          if (endTagMatch) {
            advance(endTagMatch[0].length);
            end(endTagMatch[0]);
            continue;
          }
        }
        if (textEnd > 0) {
          var text = html.substring(0, textEnd); //本文内容
          if (text) {
            // console.log("text",text);
            chars(text);
            advance(text.length); // 解析到的文本

            // console.log(html);
          }
        }
      }
      // console.log(html, 'html end');
      // console.log(root);
      return root;
    }

    function genProps(attrs) {
      var str = ''; // {name, value}
      var _loop = function _loop() {
        var attr = attrs[i];
        if (attr.name === 'style') {
          // color:red;background:red => {color:'red'}
          var obj = {};
          attr.value.split(';').forEach(function (item) {
            var _item$split = item.split(':'),
              _item$split2 = _slicedToArray(_item$split, 2),
              key = _item$split2[0],
              value = _item$split2[1];
            obj[key] = value;
          });
          attr.value = obj;
        }
        str += "".concat(attr.name, ":").concat(JSON.stringify(attr.value), ","); // a:b,c:d
      };
      for (var i = 0; i < attrs.length; i++) {
        _loop();
      }
      return "{".concat(str.slice(0, -1), "}");
    }

    // 可能是文本也可能是元素
    var defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g; // {{ dddd}} 匹配到的内容就是我们表达式的变量
    function gen(node) {
      if (node.type === 1) {
        // 元素
        return codegen(node);
      } else {
        // 文本
        var text = node.text;
        // console.log(defaultTagRE.test(text));
        if (!defaultTagRE.test(text)) {
          // 不含变量的情况 {{name}}
          return "_v(".concat(JSON.stringify(text), ")");
        } else {
          // 含变量的情况
          // _v(_s(name)+'hello'+_s(name))
          var tokens = [];
          var match;
          defaultTagRE.lastIndex = 0;
          var lastIndex = 0;
          while (match = defaultTagRE.exec(text)) {
            // console.log(match,'ooooooo');
            var index = match.index; // 匹配的位置
            // console.log(index, 'dd');
            if (index > lastIndex) {
              tokens.push(JSON.stringify(text.slice(lastIndex, index)));
            }
            tokens.push("_s(".concat(match[1].trim(), ")")); // trim 去空格
            lastIndex = index + match[0].length;
          }
          if (lastIndex < text.length) {
            tokens.push(JSON.stringify(text.slice(lastIndex)));
          }
          // console.log(tokens);
          return "_v(".concat(tokens.join('+'), ")");
        }
        // console.log(node);
      }
    }

    function genChildren(children) {
      return children.map(function (child) {
        return gen(child);
      }).join(',');
    }
    function codegen(ast) {
      var children = genChildren(ast.children);
      var code = "_c('".concat(ast.tag, "',").concat(ast.attrs.length > 0 ? genProps(ast.attrs) : 'null').concat(ast.children.length ? ",".concat(children) : '', ")");
      return code;
    }
    function compileToFunction(template) {
      // 1.就是将template 转化成ast语法树
      var ast = parseHTML(template);
      // 2.生成render方法 (render方法执行后的返回的结果就是 虚拟DOM)
      // console.log(template);
      // console.log(ast);

      // console.log(codegen(ast));

      // 模板引擎的实现原理 就是 with + new Function

      var code = codegen(ast);
      // console.log(code);
      code = "with(this){return ".concat(code, "}");
      // 使用with() 将对象属性直接变成with作用域下的变量
      var render = new Function(code); // 根据代码生成render函数
      // console.log(render.toString());

      return render;
    }

    // h() _c()
    function createElementVNode(vm, tag, data) {
      if (data == null) {
        data = {};
      }
      var key = data.key;
      if (key) {
        delete data.key;
      }
      for (var _len = arguments.length, children = new Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
        children[_key - 3] = arguments[_key];
      }
      return vnode(vm, tag, key, data, children);
    }

    // _v();

    function createTextVNode(vm, text) {
      return vnode(vm, undefined, undefined, undefined, undefined, text);
    }

    // _s()

    // ast 做的事语法层面的转化 他描述的语法本身  （可以描述js css html）
    // 我们的虚拟DOM 是描述的dom元素，可以增加一些自定义的属性  （描述dom的）
    function vnode(vm, tag, key, data, children, text) {
      return {
        vm: vm,
        tag: tag,
        key: key,
        data: data,
        children: children,
        text: text
        // ...
      };
    }

    var id$1 = 0;
    var Dep = /*#__PURE__*/function () {
      function Dep() {
        _classCallCheck(this, Dep);
        this.id = id$1++; // 属性的dep要收集watcher
        this.subs = []; // 这里存放着当前，属性对应的watcher有哪些
      }
      _createClass(Dep, [{
        key: "depend",
        value: function depend() {
          // 这里不希望放置重复的watcher，而且刚才只是一个单向的关系 dep => watcher
          // watcher 记录dep
          // this.subs.push(Dep.target);

          Dep.target.addDep(this); // 让watcher 记住dep

          // dep 和 watcher 是一个多对多的关系 （一个属性可以在多个组件中使用 dep -> 多个watcher）
          // 一个组件中由多个属性组成 （一个watcher 对应多个dep）
        }
      }, {
        key: "addSub",
        value: function addSub(watcher) {
          this.subs.push(watcher); // 有计算属性watcher现存 其次是渲染watcher  先执行计算属性watcher 在执行渲染属性watcher
        }
      }, {
        key: "notify",
        value: function notify() {
          this.subs.forEach(function (watcher) {
            watcher.update();
            // console.log(watcher);
          }); // 告诉watcher要更新了
        }
      }]);
      return Dep;
    }(); // 计算属性computed的队列   
    // 第一的watcher是渲染是触发的 进入 
    // 第二次是因为第一次渲染的取值操作触发的计算computed watcher
    // data. 属性记录的是计算属性的watcher而不是渲染属性的watcher因为直接渲染没有调用data的属性没有触发get => dep.depend() 所有dep.subs没记录 
    Dep.target = null;
    var stack = [];
    function pushTarget(watcher) {
      stack.push(watcher);
      Dep.target = watcher;
    }
    function popTarget() {
      stack.pop();
      Dep.target = stack[stack.length - 1];
    }

    var id = 0;

    // 组件优点  复用 维护简单 局部更新

    // 1) 当前我们创建渲染watcher的时候会把当前的渲染watcher放在Dep.target上
    // 2） 调用_render() 会取值 走get

    // 每个属性有一个dep (属性就是悲观者)， watcher就是观察者（属性变化了就会通知观察者来更新）  -> 观察者模式
    var Watcher = /*#__PURE__*/function () {
      // 不同组件有不同的watcher 目前只有一个 渲染实例的
      function Watcher(vm, exprOrFn, options, cb) {
        _classCallCheck(this, Watcher);
        this.id = id++;
        this.renderWatcher = options; // 是一个渲染watcher

        if (typeof exprOrFn === 'string') {
          this.getter = function () {
            return vm[exprOrFn];
          };
        } else {
          this.getter = exprOrFn; // getter意味着调用这个函数可以发生取值操作
        }

        this.deps = []; // 组件卸载   后续实现计算属性，和一些清理工作需要用到
        this.depsId = new Set();
        this.cb = cb;
        this.lazy = options.lazy;
        this.dirty = this.lazy; // 缓存值
        this.vm = vm;
        this.user = options.user; // 标识是否是用户自己的watcher

        this.value = this.lazy ? undefined : this.get();
      }
      _createClass(Watcher, [{
        key: "addDep",
        value: function addDep(dep) {
          // 一个组件即一个视图 对应着多个属性 重复的属性也不用记录
          var id = dep.id;
          if (!this.depsId.has(id)) {
            this.deps.push(dep);
            this.depsId.add(id);
            dep.addSub(this); // watcher已经记住了dep了而且已经去重了， 此时让dep也记住watcher
          }
        }
      }, {
        key: "evaluate",
        value: function evaluate() {
          // debugger
          this.value = this.get(); // 获取到用户函数的的返回值 并且还标识为脏
          this.dirty = false;
        }
      }, {
        key: "get",
        value: function get() {
          pushTarget(this); // 静态属性就是只有一份
          var value = this.getter.call(this.vm); // 会去vm上取值  vm.update(vm._render())
          popTarget(); // 渲染完毕就清空   单线程 先挂载使用后 清空
          return value;
        }
      }, {
        key: "depend",
        value: function depend() {
          // watcher 的depend 就是让watcher的dep去调用depend()
          var i = this.deps.length;
          while (i--) {
            // dep.depand()
            this.deps[i].depend(); // 让计算属性watcher 也收集渲染watcher  dep里面的depend
          }
        }
      }, {
        key: "update",
        value: function update() {
          // console.log('update');
          if (this.lazy) {
            // 如果是计算属性 依赖的值发生变化 就标识计算属性是脏值
            this.dirty = true;
          } else {
            queueWatcher(this); // 把当前的watcher 暂存起来
            // this.get(); // 重新渲染
          }
        }
      }, {
        key: "run",
        value: function run() {
          // console.log('run');
          var oldValue = this.value;
          var newValue = this.get();
          if (this.user) {
            this.cb.call(this.vm, newValue, oldValue);
          }
        }
      }]);
      return Watcher;
    }();
    var queue = [];
    var has = {};
    var pending = false; // 防抖

    function flushSchedulerQueue() {
      var flushQueue = queue.slice(0);
      queue = [];
      has = {};
      pending = false; // 一轮改变之后的恢复
      flushQueue.forEach(function (q) {
        return q.run();
      }); // 在刷新的过程中可能还有新的watcher,重新放到queue中
    }

    function queueWatcher(watcher) {
      var id = watcher.id;
      if (!has[id]) {
        queue.push(watcher);
        has[id] = true;
        // 不管我们的update执行多少次，但是最终只执行一轮刷新操作
        if (!pending) {
          nextTick(flushSchedulerQueue);
          pending = true;
        }
      }
    }

    // 使用队列将多次执行合并成一次 变量 开个异步   变成批处理
    var callbacks = [];
    var waiting = false;
    function flushCallbacks() {
      var cbs = callbacks.slice(0); // 代码先写 声明变量 之后赋值 再函数操作
      // console.log(123,vm.name);
      // console.log(app.innerHTML);
      waiting = true;
      callbacks = [];
      cbs.forEach(function (cb) {
        return cb();
      }); // 按照顺序依次执行
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

    function nextTick(cb) {
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

    function createElm(vnode) {
      var tag = vnode.tag,
        data = vnode.data,
        children = vnode.children,
        text = vnode.text;
      if (typeof tag === 'string') {
        // 标签
        vnode.el = document.createElement(tag); // 这里将真实节点和虚拟节点对应起来，后续如果修改属性  就可以通过虚拟节点找到真实节点修改

        patchProps(vnode.el, data);
        children.forEach(function (child) {
          // 数据递归
          vnode.el.appendChild(createElm(child));
        });
      } else {
        vnode.el = document.createTextNode(text);
      }
      return vnode.el;
    }

    // 更新属性
    function patchProps(el, props) {
      for (var key in props) {
        if (key === 'style') {
          for (var styleName in props.style) {
            el.style[styleName] = props.style[styleName];
          }
        } else {
          el.setAttribute(key, props[key]);
        }
      }
    }
    function patch(oldVNode, vnode) {
      // 初始化渲染流程
      // debugger

      var isRealElement = oldVNode.nodeType; // .nodeType原生方法
      // console.log(oldVNode, vnode);
      if (isRealElement) {
        var elm = oldVNode; // 获取真实元素
        // console.log(elm);
        var parentElm = elm.parentNode; // 拿到父元素
        // console.log(parentElm);
        var newElm = createElm(vnode);
        // console.log('new',newElm);

        parentElm.insertBefore(newElm, elm.nextSibling); // 插入后删除
        parentElm.removeChild(elm); // 删除老节点
        return newElm;
      }
    }
    function initLifeCycle(Vue) {
      Vue.prototype._update = function (vnode) {
        // 将vnode 转化成真是dom
        var vm = this;
        var el = vm.$el;

        // patch既有初始化的功能 又有更新
        // patch(el, vnode);
        vm.$el = patch(el, vnode);
      };

      // _c('div',{},...children)
      Vue.prototype._c = function () {
        return createElementVNode.apply(void 0, [this].concat(Array.prototype.slice.call(arguments)));
      };
      // _v(text)
      Vue.prototype._v = function () {
        return createTextVNode.apply(void 0, [this].concat(Array.prototype.slice.call(arguments)));
      };
      Vue.prototype._s = function (value) {
        // debugger
        if (_typeof(value) !== 'object') return value;
        return JSON.stringify(value);
      };
      Vue.prototype._render = function () {
        // 当渲染的时候会去实例中取值，找到就可以将属性和试图绑定在一起

        // console.log('render');
        var vm = this;
        // 让with中的this指向vm
        // debugger
        // console.log(); 
        return vm.$options.render.call(vm); // 通过ast语法转义后生成的render方法
      };
    }

    function mountComponent(vm, el) {
      // 这里的el是通过querySelector处理过的 options里的el是没处理过的

      vm.$el = el;

      // 1.调用render方法产生虚拟节点 虚拟DOM
      // debugger

      var updateComponent = function updateComponent() {
        vm._update(vm._render()); // vm.$options.render()  虚拟节点
      };

      new Watcher(vm, updateComponent, true); // true用于表识是一个渲染watcher
      // console.log(watcher);
      // 2.根据虚拟DOM产生真实DOM

      // 3.插入到el元素中
    }

    // vue核心流程 1） 创造了响应式数据 2） 模板转换成ast语法树
    // 3） 将ast语法树转换了render函数  4） 后续每次数据更新可以只执行render函数 （无需再次执行ast转化的过程）

    // render函数会产生虚拟节点 （使用响应式数据）
    // 根据生成的虚拟节点创造真实的DOM

    function callHook(vm, hook) {
      var handlers = vm.$options[hook];
      if (handlers) {
        handlers.forEach(function (handler) {
          handler.call(vm);
        });
      }
    }

    // 重新数组的部分方法

    var oldArrayProto = Array.prototype; // 获取数组的原型

    // newArrayProto.__proto__ = oldArrayProto
    var newArrayProto = Object.create(oldArrayProto);
    var methods = [
    // 找到所有变异方法
    'push', 'pop', 'shift', 'unshift', 'reverse', 'sort', 'splice']; // concat slice 都不会改变原数组 只有上面七个方法会改变数组

    methods.forEach(function (method) {
      newArrayProto[method] = function () {
        var _oldArrayProto$method;
        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }
        // 这里重新数组方法

        var result = (_oldArrayProto$method = oldArrayProto[method]).call.apply(_oldArrayProto$method, [this].concat(args)); // 内部调用原来的方法，函数的劫持 切片编程
        // console.log("method", method);

        // 我们需要对新增的 数据再次进行劫持
        var inserted;
        var ob = this.__ob__;
        switch (method) {
          case 'push':
          case 'unshift':
            // arr.unshift(1,2,3)
            inserted = args;
            break;
          case 'splice':
            // arr.splice(0,1,{a:1},{a:1})
            inserted = args.slice(2);
        }
        if (inserted) {
          ob.observeArray(inserted);
        }
        ob.dep.notify(); // 数组变化了通知对应的watcher实现更新逻辑
        return result;
      };
    });

    var Observer = /*#__PURE__*/function () {
      function Observer(data) {
        _classCallCheck(this, Observer);
        // 给每个对象对增加收集功能
        this.dep = new Dep(); // 所有对象都要增加dep

        // Object.defineProperty只能劫持已经存在的属性，后增的或者删除的不知道 （vue里面会为此单独写一些api $set $delete）

        Object.defineProperty(data, '__ob__', {
          value: this,
          enumerable: false // 将__ob__变成不可枚举 （循环的时候无法获取到）
        });

        // data.__ob__ = this // 数据加了一个__ob__则说明这个属性被观测过了

        if (Array.isArray(data)) {
          // 这里我们可以重写数组中的方法 7个变异方法 是可以修改数组本身

          // data.__proto__ = ?  直接重写会导致数组原有的方法 丢失 需要保留数组原有的特性，并且可以重新部分方法

          data.__proto__ = newArrayProto; // 需要保留数组原有特性，并且可以重写部分方法

          this.observeArray(data); // 数组中的存放对象 可以监控到对象的变化
        } else {
          this.walk(data);
        }
      }
      _createClass(Observer, [{
        key: "walk",
        value: function walk(data) {
          // 循环对象 对属性依次劫持

          // ”重新定义“属性  性能差
          Object.keys(data).forEach(function (key) {
            return defineReactive(data, key, data[key]);
          }); // 将属性变为响应   定义成响应式  
        }
      }, {
        key: "observeArray",
        value: function observeArray(data) {
          // 观测数组
          data.forEach(function (item) {
            observe(item);
          });
        }
      }]);
      return Observer;
    }(); // 深层次嵌套会递归,递归多了性能差,不存在的属性监控不到,存在的属性要重写方法 vue3-> proxy
    function dependArray(value) {
      for (var i = 0; i < value.length; i++) {
        var current = value[i];
        current.__ob__ && current.__ob__.dep.depend();
        if (Array.isArray(current)) {
          dependArray(current);
        }
      }
    }

    // 方法可单独使用 后面可以导出使用 所以不是 直接写在Observer类里面

    function defineReactive(target, key, value) {
      // 闭包 属性劫持
      // childOb.dep 用来收集依赖的
      var childOb = observe(value); // 对所有的对象都进行属性劫持   递归的形式  只是对对象进行迭代劫持 数组没有
      var dep = new Dep(); // 每个属性都有一个dep
      // Object.defineProperty() 使用的是 defineReactive 的变量 即使用了外部数据 所以外不的数据 变量不能够被销毁  相当于形成闭包
      // 不被销毁是因为，get set监听事件是全局事件，不被销毁，内部函数保存着外部函数的作用域，所以外部函数有引用，也不会被销毁。coderwhy
      Object.defineProperty(target, key, {
        get: function get() {
          // 取值的时候 会执行get
          // console.log('key', key);

          if (Dep.target) {
            dep.depend(); // 让这个属性的收集器记住当前，的watcher
            if (childOb) {
              childOb.dep.depend(); // 让数组和对象本身也实现依赖收集

              if (Array.isArray(value)) {
                dependArray(value);
              }
            }
          }
          return value;
        },
        set: function set(newValue) {
          // 修改的时候 会执行
          if (newValue === value) return; // 做判断减少性能损耗  赋值性能损耗大
          observe(newValue); // 修改后继续劫持
          value = newValue;
          dep.notify(); // 通知更新
        }
      });
    }

    function observe(data) {
      // 对这个对象进行劫持
      if (_typeof(data) !== "object" || data == null) {
        // 如果是函数在state.js已经将this指向实例对象了   或语句 
        return; // 只对对象进行劫持
      }

      if (data.__ob__ instanceof Observer) {
        // 说明这个对象已经被代理过了
        return data.__ob__;
      }
      // 如果一个对象劫持过了，那就不需要再被劫持了 （要判断一个对象是否被劫持过，可以添加一个实例，用实例来判断是否被劫持过）

      return new Observer(data);
    }

    function initState(vm) {
      var opts = vm.$options;
      if (opts.data) {
        initData(vm);
      }
      if (opts.computed) {
        initComputed(vm);
      }
      if (opts.watch) {
        initWatch(vm);
      }
    }
    function initWatch(vm) {
      var watch = vm.$options.watch;
      for (var key in watch) {
        var handler = watch[key]; // 字符串 数组 函数

        if (Array.isArray(handler)) {
          for (var i = 0; i < handler.length; i++) {
            createWatcher(vm, key, handler[i]);
          }
        } else {
          createWatcher(vm, key, handler);
        }
      }
    }
    function createWatcher(vm, key, handler) {
      // 字符串 数组 函数
      if (typeof handler === 'string') {
        handler = vm[handler];
      }
      return vm.$watch(key, handler);
    }

    // vm 代理 vm._data
    function proxy(vm, target, key) {
      Object.defineProperty(vm, key, {
        get: function get() {
          return vm[target][key];
        },
        set: function set(newValue) {
          vm[target][key] = newValue;
        }
      });
    }
    function initData(vm) {
      var data = vm.$options.data; // data可能是函数和对象  

      data = typeof data === 'function' ? data.call(vm) : data; // data.call(this) 使this指向实例对象 html new的Vue 或者使用vm 代替
      // data.call(vm)  将函数转换为对象 之所以使用 .call() 直接使用data() this指向全局 数据泄露
      // data 是用户返回的对象
      // 根实例可以是对象也可以的函数 组件就只能的是函数

      vm._data = data; // 将用户返回的对象放到 _data上

      // 对数据进行劫持 vue2 里采用了一个api defineProperty

      observe(data);

      // 将vm._data 用vm代理就可以了
      for (var key in data) {
        proxy(vm, '_data', key);
      }
    }
    function initComputed(vm) {
      var computed = vm.$options.computed;
      var watchers = vm._computedWatchers = {}; // 将计算属性的watcher保存到vm上

      for (var key in computed) {
        var userDef = computed[key];

        // 我们需要监控 计算属性中的个体变化
        var fn = typeof userDef === 'function' ? userDef : userDef.get;

        // 如果直接new Watcher 默认就会执行fn,将属性和watcher对应起来
        watchers[key] = new Watcher(vm, fn, {
          lazy: true
        });
        defineComputed(vm, key, userDef);
      }
    }
    function defineComputed(target, key, userDef) {
      // const getter = typeof userDef === 'function' ? userDef : userDef.get;
      var setter = userDef.set || function () {};

      // 可以通过实例拿到对应的属性
      Object.defineProperty(target, key, {
        // 这里直接将computed的方法或者属性直接挂载到vm实例上可以直接调用 而且是响应式 可以vm. 调用
        get: createComputedGetter(key),
        set: setter
      });
    }

    // 计算属性根本不会收集依赖，只会让自己的依赖属性去收集依赖
    function createComputedGetter(key) {
      // 我们需要检测是否要执行这个getter
      return function () {
        var watcher = this._computedWatchers[key]; // 获取到对应属性的watcher
        if (watcher.dirty) {
          // 如果是脏的就去执行 用户传入的函数
          watcher.evaluate(); // 求值后dirty变为false,下次就不求值
        }

        if (Dep.target) {
          // j计算属性出栈后 还要渲染watcher, 我们应该让计算属性watcher里面的属性 也收集上一层watcher
          watcher.depend();
        }
        return watcher.value; // 最后返回的是watcher上的值
      };
    }

    function initStateMixin(Vue) {
      Vue.prototype.$nextTick = nextTick;
      // 最终调用
      Vue.prototype.$watch = function (exprOrFn, cb) {
        // console.log(exprOrFn,cb,options);

        // firstname
        // ()=>vm.firstname
        // firstname的值变化了 直接执行cb函数即可
        new Watcher(this, exprOrFn, {
          user: true
        }, cb);
      };
    }

    function initMixin(Vue) {
      // 就是给Vue增加init方法的
      Vue.prototype._init = function (options) {
        // 用于初始化操作
        // vue vm.$options 就是获取用户的配置

        // 我们使用 vue的时候 $nextTick $data $attr.... 其实就是区分vue的自己的属性
        var vm = this; // Vue

        // 我们定义的全局指令和过滤器.... 都会挂载到实例上
        vm.$options = mergeOptions(this.constructor.options, options); // 将用户的选项挂载到实例上 this是实例this.constructor 就是Vue.options 就是全局的options

        callHook(vm, 'beforeCreate');
        // 初始化状态，初始化属性，watcher
        // 数据的初始化对用户的数据的处理  
        initState(vm);
        callHook(vm, 'created');
        if (options.el) {
          vm.$mount(options.el); // 实现数据的挂载
        }
      };

      Vue.prototype.$mount = function (el) {
        var vm = this;
        el = document.querySelector(el);
        // vm.$el = el
        var ops = vm.$options;
        if (!ops.render) {
          // 先进行查找有没有renderh函数
          var template; // 没有render看一下是否写了template, 没有template采用外部的template
          if (!ops.template && el) {
            // 没有写模板 但写了el
            template = el.outerHTML;
          } else {
            if (el) {
              template = ops.template;
            }
          }
          // 写了template 就用 写的template
          if (template) {
            // 这里需要对模板进行编译
            // console.log(template);
            var render = compileToFunction(template);
            // console.log(render);
            ops.render = render;
          }
        }
        // console.log( ops.render); // 最终就可以获取的render方法
        mountComponent(vm, el); // 组件的挂载
        // script 标签引用的vue.global.js 这个编译过程式在浏览器运行的
        // runtime是不包含模板编译的，整个编译是打包的时候通过loader来转义.vue文件的，用runtime的时候不能使用template
      };
    }

    // 模块化开发使用构造函数 而不是 class类

    //  将所有的方法都耦合在一起
    function Vue(options) {
      this._init(options);
    }
    initMixin(Vue); // 扩展init方法
    initLifeCycle(Vue); // vm._update vm._render

    initGlobalAPI(Vue); // 全局api的实现

    initStateMixin(Vue); // 实现nextTick $watch

    return Vue;

}));
//# sourceMappingURL=vue.js.map
