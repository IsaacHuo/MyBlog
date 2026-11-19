// Removes the font-loading overlay once the reading fonts are ready.
// The overlay itself is drawn by an inline <style> + <script> in <head>.
(function () {
  var root = document.documentElement
  if (!root.classList.contains('font-loading')) return

  var isZh = (root.lang || '').indexOf('zh') === 0
  var copy = isZh
    ? { skip: '先逛逛', retry: '重新載入字體' }
    : { skip: 'Browse anyway', retry: 'Reload fonts' }

  function done(remember) {
    root.classList.remove('font-loading')
    if (remember) {
      try { sessionStorage.setItem('blog-fonts-ready', '1') } catch (e) { /* private mode */ }
    }
    var actions = document.getElementById('font-loader-actions')
    if (actions) actions.remove()
  }

  function load() {
    var jobs = [
      document.fonts.load('400 1em Lora', 'Aa'),
      document.fonts.load('italic 400 1em Lora', 'Aa')
    ]
    if (isZh) jobs.push(document.fonts.load('1em BlogEdukaiSite', '\u6587\u7AE0'))
    return Promise.all(jobs)
  }

  function showActions() {
    if (!root.classList.contains('font-loading') || document.getElementById('font-loader-actions')) return
    var box = document.createElement('div')
    box.id = 'font-loader-actions'
    box.className = 'font-loader-actions'
    var retry = document.createElement('button')
    retry.type = 'button'
    retry.textContent = copy.retry
    retry.onclick = function () { load().then(function () { done(true) }, function () {}) }
    var skip = document.createElement('button')
    skip.type = 'button'
    skip.textContent = copy.skip
    skip.onclick = function () { done(false) }
    box.appendChild(retry)
    box.appendChild(skip)
    document.body.appendChild(box)
    skip.focus()
  }

  setTimeout(showActions, 8000)
  load().then(function () { done(true) }, function () { showActions() })
})()
