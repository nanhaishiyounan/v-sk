export function getRandom(n = 6) {
  let randomNum = []
  for (let i = 0; i < n; i++) {
    randomNum.push(Math.floor(Math.random() * 10))
  }
  return randomNum.join('')
}

export function measureLineHeight(el) {
  const { lineHeight: elLineHeight, fontSize: elFontSize, fontFamily: elFontFamily } = getComputedStyle(el)

  if (elLineHeight === 'normal') {
    if (!window.__normal_line_height__) {
      window.__normal_line_height__ = {}
    }
    if (!window.__normal_line_height__[elFontFamily]) {
      const div = document.createElement('div')
      div.style.cssText = `font-size: 100px;line-height: normal;opacity: 0;position: absolute;font-family: ${elFontFamily};`
      div.innerHTML = '测量行高ABC'
      document.body.appendChild(div)

      window.__normal_line_height__[elFontFamily] = div.getBoundingClientRect().height / 100
      div.remove()
    }

    return (dimension(elFontSize) * window.__normal_line_height__[elFontFamily]) / dimension(window.__html_font_size__) + 'px'
  }
  return dimension(elLineHeight) / dimension(window.__html_font_size__) + 'px'
}

export function initAnimation() {
  if (window.__init_animation_done__) {
    return
  }
  window.__init_animation_done__ = true
  const styleEl = document.createElement('style')
  styleEl.innerHTML = `
      [data-skeleton-id]:empty::after {
        content: '\\feff' !important;
      }
      @keyframes transparent {
        0% {
          opacity: 0.3;
        }
      
        50% {
          opacity: 0.5;
        }
      
        to {
          opacity: 0.3;
        }
      }
  `
  document.getElementsByTagName('HEAD')[0].append(styleEl)
}

export function initElHeight(id, value) {
  const styleEl = document.createElement('style')
  styleEl.dataset.styleSkeletonHeightId = id
  const totalLines = (value ?? ['1']).reduce((t, v) => {
    t = v.startsWith('+') ? t : t + parseInt(v)
    return t
  }, 0)
  let content = ''
  for (let i = 0; i < totalLines; i++) {
    content += '\\200B\\A'
  }
  styleEl.innerHTML = `
      [data-skeleton-id="${id}"]:empty::after {
        content: '${content}';
        white-space: pre;
      }
  `
  document.getElementsByTagName('HEAD')[0].append(styleEl)
}

let htmlEl = null
export function refreshHtmlFontSize() {
  if (!htmlEl) {
    htmlEl = document.querySelector('html')
  }
  window.__html_font_size__ = getComputedStyle(htmlEl).fontSize
}

export function dimension(num) {
  return parseFloat(num || 0)
}

export function unitify(num, u) {
  if (isUnit(num, u)) {
    return num
  }

  if (u === 'rem') {
    return dimension(num) / dimension(window.__html_font_size__) + 'rem'
  }

  const reg = /\d*\.?\d+/
  return String(num).match(reg)[0] + u
}

export function unit(num) {
  const reg = /[^\d.]+/
  const result = String(num).match(reg)
  return result ? result[0] : ''
}

export function isUnit(num, u) {
  const reg = new RegExp(`\\d*\\.?\\d+(${u})$`)
  return reg.test(num)
}

export const placeHolderImage = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
