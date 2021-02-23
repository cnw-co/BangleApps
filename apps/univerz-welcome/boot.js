(function() {
  let s = require('Storage').readJSON('welcome.json', 1) || {};
  if (!s.welcomed) {
    setTimeout(() => {
      require('Storage').write('welcome.json', {welcomed: true})
      load('univerz-welcome.app.js')
    })
  }
})()
