const blobCode = function fn() {
  onmessage = ({ data: { id, name, payload } }) => {
    if (name === 'skeletonStyle') {
      let { value, argRadio, argBias, elLineHeight, deep, elColor } = payload

      value = value ?? ['1']
      const options = []
      const lineImages = []
      let totalWidth = 0
      let minWidth = 0
      let totalHeight = 0

      for (let i = 0; i < value.length; i++) {
        let { isSameLine, lines, width: valWidth, height: valHeight, positionX: valPositionX, radio: valRadio, bias: valBias, color } = formatLineValue(value[i])
        color = color ?? elColor
        let pre = options[i - 1] ?? {
          lines: '1',
          width: '100%',
          height: '0',
          positionX: '0',
          radio: argRadio,
          bias: argBias,
          positionY: '0',
          lineHeight: elLineHeight,
          direction: 'left'
        }

        let width = valWidth ?? pre.width
        let height = valHeight ?? dimension(pre.lineHeight) * lines + unit(pre.lineHeight)
        let maxHeight = isSameLine ? Math.max(dimension(height), dimension(pre.maxHeight)) + unit(height) : height
        let positionX = valPositionX ?? pre.positionX
        let direction = dimension(positionX) < 0 || positionX === '-0' ? 'right' : 'left'
        let radio = valRadio ?? pre.radio
        let bias = valBias ?? pre.bias
        let positionY = isSameLine ? pre.positionY : dimension(pre.height) + dimension(pre.positionY) + unit(pre.lineHeight)
        let lineHeight = dimension(height) / lines + unit(height)

        options[i] = { isSameLine, lines: dimension(lines), width, height, maxHeight, positionX, direction, radio, bias, positionY, lineHeight, color }

        totalHeight = isSameLine ? dimension(totalHeight) + dimension(maxHeight) - dimension(pre.maxHeight) + unit(height) : dimension(totalHeight) + dimension(height) + unit(height)
      }

      for (let i = 0; i < value.length; i++) {
        options[i].totalHeight = totalHeight
        const newImages = drawLines(options[i])
        lineImages.push(...newImages.lineImages)
      }

      for (let i = 0; i < value.length; i++) {
        let w = options[i].width
        let p = options[i].positionX
        let d = options[i].direction
        if (unit(w) === '%' || d === 'right') {
          minWidth = '100%'
          break
        } else {
          minWidth = Math.max(dimension(minWidth), dimension(w) + (unit(p) !== '%' ? dimension(p) : 0)) + unit(w)
          minWidth = unitify(minWidth, 'rem')
        }
      }
      const skStyle = skeletonStyle({ id, lineImages, totalHeight, totalWidth, minWidth, deep })
      postMessage({ id, name: 'skeletonStyle', payload: { skStyle } })
    }

    if (name === 'skeletonImageStyle') {
      let { value, elColor } = payload

      let { width: valWidth, height: valHeight, color } = formatLineValue((value ?? ['- -'])[0])

      const width = valWidth ? `width: ${unit(valWidth) === 'px' ? unitify(valWidth, 'rem') : valWidth};` : ''
      const height = valHeight ? `height: ${unit(valHeight) === 'px' ? unitify(valHeight, 'rem') : valHeight};` : ''

      color = color || elColor || '#dddddd'
      const bg = `background: ${color} center center/60% 60% no-repeat ;`
      const animation = `animation: transparent 2s linear 0s infinite !important;`

      const skStyle = `
              [data-skeleton-id='${id}'][src="${placeHolderImage}"] {
                pointer-events: none;
                ${width}
                ${height}
                ${bg}
                background-image: url('${imgBg}');
                ${animation}
              }
              `
      postMessage({ id, name: 'skeletonImageStyle', payload: { skStyle } })
    }
  }

  const imgBg =
    'data:image/svg+xml,<svg color="white" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M96 896a32 32 0 0 1-32-32V160a32 32 0 0 1 32-32h832a32 32 0 0 1 32 32v704a32 32 0 0 1-32 32H96zm315.52-228.48-68.928-68.928a32 32 0 0 0-45.248 0L128 768.064h778.688l-242.112-290.56a32 32 0 0 0-49.216 0L458.752 665.408a32 32 0 0 1-47.232 2.112zM256 384a96 96 0 1 0 192.064-.064A96 96 0 0 0 256 384z"></path></svg>'

  const placeHolderImage = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'

  function drawLines({ lines, width, height, positionX: x, direction, radio, bias, positionY: y, totalHeight, color }) {
    const lineImage = `linear-gradient(transparent 0%, transparent ${bias}%, ${color} ${bias}%, ${color} ${dimension(radio) + dimension(bias)}%, transparent ${
      dimension(radio) + dimension(bias)
    }%, transparent 100%)`

    let positionX = unit(x) === 'px' ? unitify(x, 'rem') : x

    const sizeX = unit(width) === 'px' ? unitify(width, 'rem') : width
    let sizeY = dimension(height) / lines + unit(totalHeight)
    sizeY = unit(sizeY) === 'px' ? unitify(sizeY, 'rem') : sizeY
    const noRepeat = 'no-repeat'

    let positionY = function (i) {
      if (unit(y) === '%') {
        return (dimension(y) + i * dimension(sizeY)) / (dimension(totalHeight) - dimension(sizeY)) + unit(totalHeight)
      }
      const result = dimension(y) + i * dimension(sizeY) + unit(totalHeight)
      return unit(result) === 'px' ? unitify(result, 'rem') : result
    }

    let lineImages = []

    for (let i = 0; i < lines; i++) {
      lineImages.push(`${lineImage} ${direction} ${positionX} top ${positionY(i)}/${sizeX} ${sizeY} ${noRepeat}`)
    }
    return { lineImages }
  }

  function skeletonStyle({ id, lineImages, totalHeight, minWidth, deep }) {
    const height = unit(totalHeight) === 'px' ? unitify(totalHeight, 'rem') : totalHeight
    const scopeLimit = `[data-skeleton-id='${id}']:empty {
      pointer-events: none;
    }
    `
    const limitMaxHeight = `[data-skeleton-id='${id}']:empty {
        line-height: ${height} !important;
      }
      `

    let deepSelector = ''

    if (deep) {
      deepSelector += `, [data-skeleton-id='${id}'] *:not([data-skeleton-id]):empty::after`
    }

    const cssBegin = `[data-skeleton-id='${id}']:empty::after${deepSelector} {`

    //     width: 100% !important;
    const base = `
      content: '' !important;
      display: inline-block !important;
      vertical-align: top !important;
  
      min-width: ${minWidth} !important;
      height: ${height} !important;
      white-space: pre !important;
      animation: transparent 1s ease-in-out 0s infinite !important;
      `
    const background = 'background:' + lineImages.join(', ') + '!important;'
    const cssEnd = '}'
    return `${scopeLimit} ${limitMaxHeight} ${cssBegin}${base}${background}${cssEnd}`
  }

  function unitify(dimension, unit) {
    if (isUnit(dimension, unit)) {
      return dimension
    }
    const reg = /\d*\.?\d+/
    return String(dimension).match(reg)[0] + unit
  }

  function unit(dimension) {
    const reg = /[^\d.]+/
    const result = String(dimension).match(reg)
    return result ? result[0] : ''
  }

  function dimension(dimension) {
    return parseFloat(dimension || 0)
  }

  function isUnit(dimension, unit) {
    const reg = new RegExp(`\\d*\\.?\\d+(${unit})$`)
    return reg.test(dimension)
  }

  function formatLineValue(lineValueStr) {
    let isSameLine = false
    let lines = null
    let width = null
    let height = null
    let positionX = null
    let radio = null
    let bias = null
    let color = null

    lineValueStr
      .trim()
      .split(/\s+/)
      .map((v, index, arr) => {
        if (index === 0) {
          lines = arr[0]
          isSameLine = v.startsWith('+')
          return null
        }

        if (v.includes(':')) {
          const radios = v.split(':')
          radio = radios[0]
          bias = radios[1]
          return null
        }

        if (!arr[index].startsWith('-') && !/^[\d.]+/.test(arr[index])) {
          color = arr[index]
          return null
        }

        const value = v === '-' ? undefined : !unit(v) ? unitify(v, 'px') : v
        if (lines === null) {
          lines = arr[0]
        } else if (width === null) {
          width = value
        } else if (height === null) {
          height = value
        } else if (positionX === null) {
          positionX = value
        }

        return arr[index]
      })

    return { isSameLine, lines, width, height, positionX, radio, bias, color }
  }
}

const blob = new Blob([`(${blobCode})()`], { type: 'text/javascript' })

export default URL.createObjectURL(blob)
