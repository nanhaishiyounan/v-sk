import workerUrl from './workerUrl'
import { initAnimation, measureLineHeight, unitify, getRandom, placeHolderImage, initElHeight } from './util'

const pool = []
const maxCount = 20
let pointer = 0
for (let i = 0; i < maxCount; i++) {
  const worker = new Worker(workerUrl)
  pool.push(worker)
}
const workPool = {
  getWorker: () => {
    if (pointer > maxCount - 1) {
      pointer = 0
    }
    return pool[pointer++]
  }
}

const poolPostMessage = msg => {
  const skWorker = workPool.getWorker()
  if (!skWorker.onmessage) {
    skWorker.onmessage = e => {
      const {
        id,
        name,
        payload: { skStyle }
      } = e.data

      if (name === 'skeletonStyle') {
        if (!document.querySelector(`[data-skeleton-id="${id}"]:empty`) && !document.querySelector(`[data-skeleton-id="${id}"] *:empty`)) {
          return
        }
        const styleEl = document.createElement('style')
        styleEl.dataset.styleSkeletonId = id
        styleEl.innerHTML = skStyle
        document.getElementsByTagName('HEAD')[0].append(styleEl)
      }
      if (name === 'skeletonImageStyle') {
        if (!document.querySelector(`img[data-skeleton-id="${id}"][src="${placeHolderImage}"]`)) {
          return
        }
        const styleEl = document.createElement('style')
        styleEl.dataset.styleSkeletonId = id
        styleEl.innerHTML = skStyle
        document.getElementsByTagName('HEAD')[0].append(styleEl)
      }
    }
  }
  skWorker.postMessage(msg)
}

initAnimation()

export default {
  beforeMount(el, binding) {
    el.dataset.skeletonId = getRandom(8)
    let { value } = binding

    const tagName = el.tagName
    if (tagName === 'IMG') {
      const src = el.getAttribute('src')
      if (src?.trim()) {
        return
      }
      el.setAttribute('src', placeHolderImage)
    } else {
      initElHeight(el.dataset.skeletonId, value)
    }
  },
  mounted(el, binding) {
    if (el.__skeleton_done__) {
      return
    }
    let { value, arg, modifiers } = binding
    const [argRadio = '60', argBias = '20'] = arg?.split(':') || []
    const { deep = false } = modifiers
    const elColor = getComputedStyle(el).color
    const tagName = el.tagName

    if (tagName === 'IMG') {
      poolPostMessage({ id: el.dataset.skeletonId, name: 'skeletonImageStyle', payload: { value, elColor, htmlFontSize: window.__html_font_size__ } })
    } else {
      const elLineHeight = measureLineHeight(el)
      poolPostMessage({ id: el.dataset.skeletonId, name: 'skeletonStyle', payload: { value, argRadio, argBias, elLineHeight, deep, elColor, htmlFontSize: window.__html_font_size__ } })
    }
  },

  unmounted(el) {
    el.__skeleton_done__ = true
    el.removeAttribute('data-skeleton-id')
    document.querySelector(`[data-style-skeleton-id="${el.dataset.skeletonId}"]`)?.remove()
    document.querySelector(`[data-style-skeleton-height-id="${el.dataset.skeletonId}"]`)?.remove()
  }
}
