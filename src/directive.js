import workerUrl from './workerUrl'
import { initAnimation, measureLineHeight, unitify, getRandom, placeHolderImage } from './util'

const pool = []
const maxCount = 20
let pointer = 0
const workPool = {
  getWorker: () => {
    if (pointer > maxCount - 1) {
      pointer = 0
    }
    if (pool.length < maxCount) {
      const worker = new Worker(workerUrl)
      pool.push(worker)
      return worker
    } else {
      return pool[pointer++]
    }
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
  beforeMount(el) {
    el.dataset.skeletonId = getRandom(16)
    const tagName = el.tagName
    if (tagName === 'IMG') {
      const src = el.getAttribute('src')
      if (src?.trim()) {
        return
      }
      el.setAttribute('src', placeHolderImage)
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
      poolPostMessage({ id: el.dataset.skeletonId, name: 'skeletonImageStyle', payload: { value, elColor } })
    } else {
      const elLineHeight = measureLineHeight(el)
      poolPostMessage({ id: el.dataset.skeletonId, name: 'skeletonStyle', payload: { value, argRadio, argBias, elLineHeight, deep, elColor } })
    }
  },

  unmounted(el) {
    el.__skeleton_done__ = true
    el.removeAttribute('data-skeleton-id')
    document.querySelector(`[data-style-skeleton-id="${el.dataset.skeletonId}"]`)?.remove()
  }
}
