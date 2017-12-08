var _touch = new touch()
_touch.on(document.getElementsByClassName('test')[0], 'dbTouch', function () {
  console.log('left')
})
_touch.on(document.getElementsByClassName('test')[0], 'dbTouch', function () {
  console.log('left')
})
_touch.on(document.getElementsByClassName('test')[0], 'touch', function () {
  console.log(arguments)
})
