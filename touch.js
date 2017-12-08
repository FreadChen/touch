// 常用辅助对象
class auxiliaryTools {
  constructor () {

  }
  // 正确获取Event对象，兼容IE
  c_getEvent (event) {
    return event || window.event
  }
  // 自定义事件，先检测是否支持CustomEvent,已知IE8及以下不支持
  c_createEvent (obj, detail) {
    if (document.implementation.hasFeature("CustomEvents", "3.0")) {
      auxiliaryTools.prototype.c_createEvent = function (obj) {
        let arr = {}
        if (obj instanceof Array) {
          for(let item of obj) {
            arr[item] = document.createEvent("CustomEvent")
            arr[item].initCustomEvent(item, true, true, detail)
          }
        }
        return arr
      }
      return auxiliaryTools.prototype.c_createEvent(obj)
    } else {
      console.error("createEvent does not support 'CustomEvent' parameters")
      return false
    }
  }
}
// touch事件拓展
class touch extends auxiliaryTools {
    constructor(obj) {
      super()
      // 如果支持自定义事件使用自定义事件，不支持则利用数组
      this.event = super.c_createEvent(['touch', 'dbTouch', 'longTouch', 'leftTouch', 'rightTouch', 'upTouch', 'downTouch'], this.obj)
      // 事件代理列表,如果不支持事件3级则使用数组，暂时无用
      this.event = this.event || {
        touch: [],
        longTouch: [],
        leftMove: [],
        rightMove: [],
        topMove: [],
        bottomMove: []
      }
      this.obj = {
        elm: document.body,
        x: 50,  // 横坐标的容错值
        y: 50,  // 纵坐标的容错值
        db: 0,
        interval: 200,  // dbTouch有效时间间隔
        touchTime: 1000,
        dbTimeout: null,
        x1: 0,  // 初始横坐标
        y1: 0,  // 初始纵坐标
        timeStart: 0, // 初始时间戳
        x2: 0,  // 结束横坐标
        y2: 0,  // 结束纵坐标
        timeEnd: 0, // 结束时间戳
        sX: 0, // 存放横坐标差
        sY: 0, // 存放纵坐标差
        sTime: 0,  // 存放touch事件的时间长度
        len: 0 // 记录多少个触摸点
      }
      // 获取坐标差和时间差
      this.getXandYandTime =function () {
        this.obj.sX = this.obj.x2 - this.obj.x1
        this.obj.sY = this.obj.y2 - this.obj.y1
        this.obj.sTime = this.obj.timeEnd - this.obj.timeStart
      }
      Object.assign(this.obj, obj)
      // 防止在特定环境中this的指向不是touch对象的问题
      this.$touchstart = this.$touchstart.bind(this)
      this.$touchmove = this.$touchmove.bind(this)
      this.$onEvent = this.$onEvent.bind(this)
    }
  // 初始化绑定touchstart、touchmove、touchend事件，用于判断用户执行的操作
  // 判断touch类型
   $onEvent (event) {
     event = super.c_getEvent(event)
     // 当前只支持单点触碰
      if (this.obj.len != 1) {
        return
      }
      // 存储事件类型
      let str = ''
     // 事件结束时间
      this.obj.timeEnd = new Date().getTime()
     // 这个可以优化一下，应该return回来
      this.getXandYandTime()
      // 判断是否为点击事件
      if (Math.abs(this.obj.sX) < this.obj.x
        && Math.abs(this.obj.sY) < this.obj.y){
        if (this.obj.sTime < 1000) {
          str = 'touch'
          // 延迟判断是否是双击事件
          if(this.obj.db === 0 && !this.obj.dbTimeout) {
            this.obj.dbTimeout = setTimeout(() => {
              if (this.obj.db > 1) {
                str = 'dbTouch'
              }
              this.obj.db = 0
              // 触发自定义事件
              event.target.dispatchEvent(this.event[str])
              this.obj.dbTimeout = undefined
            }, this.obj.interval)
          }
          this.obj.db ++
          return;
        }
        else if (this.obj.sTime > 1000) {
          str = 'longTouch'
        }
      }
      else {
        if (Math.abs(this.obj.sX) > Math.abs(this.obj.sY)) {
          if (this.obj.sX > 0) {
            str = 'rightTouch'
          } else {
            str = 'leftTouch'
          }
        }
        else {
          if (this.obj.sY > 0) {
            str = 'downTouch'
          } else {
            str = 'upTouch'
          }
        }
      }
     event.target.dispatchEvent(this.event[str])
      // this.mapEvent(str, event)
    }
    $touchstart (event) {
      event = super.c_getEvent(event)
      // 保证是单指点击事件
      this.obj.len = event.touches.length
      if (this.obj.len === 1) {
        this.obj.x1 = this.obj.x2 = event.touches[0].pageX
        this.obj.y1 = this.obj.y2 = event.touches[0].pageY
        this.obj.timeStart = new Date().getTime()
      }
    }
    $touchmove (event) {
      event = super.c_getEvent(event)
      if (this.obj.len === 1){
        this.obj.x2 = event.touches[0].pageX
        this.obj.y2 = event.touches[0].pageY
      }
    }
    // 绑定自定义事件
    on(elm, str, fn) {
      // 不可以这样做，多次绑定的时候会有重复绑定touchstart等的问题
      // on应该只绑定event,而不是做处理
      elm.addEventListener('touchstart', this.$touchstart)
      elm.addEventListener('touchmove', this.$touchmove)
      elm.addEventListener('touchend', this.$onEvent)
      elm.addEventListener('touchcancel', this.$onEvent)
      elm.addEventListener(str, fn)
      // this.event[str].push(fn)
      return this
    }
    // 解绑自定义事件
    off(elm, str) {
      this.event[str] = []
      return this
    }
    // 执行自定义事件
    mapEvent(str, event) {
      for(let val of this.event[str]){
        val(event)
      }
    }
  }