(function() {
  let s = require('Storage').readJSON('univerz-welcome.json', 1) || {};
  if (!s.welcomed) {
    setTimeout(() => {
      require('Storage').write('univerz-welcome.json', {welcomed: true})
      load('univerz-welcome.app.js')
    })
  }
})()
