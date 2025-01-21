import { render } from 'vue'
import MyGoButton from '../components/MyGoButton.vue'
import { createPopper } from '@popperjs/core'
import { useConfigManager } from '../utils/config-manager'
import '.virtual/master.css'

// import { initCSSRuntime } from '@master/css-runtime'
// initCSSRuntime()

let buttonContainer: HTMLElement | null = null
let popperInstance: any = null
let resizeObserver: ResizeObserver | null = null
let referenceElement: HTMLElement | null = null
const getMousePositionReferenceElement = () => {
  if (!referenceElement) {
    referenceElement = null
    referenceElement = document.createElement('span')
    referenceElement.style.pointerEvents = 'none'
    referenceElement.style.position = 'absolute'
    referenceElement.style.width = '0px'
    referenceElement.style.height = '0px'
    document.body.appendChild(referenceElement)
  }
  return referenceElement
}
const updateMousePositionReference = (event: MouseEvent) => {
  const x = event.clientX + window.scrollX
  const y = event.clientY + window.scrollY

  const referenceElement = getMousePositionReferenceElement()
  referenceElement.style.left = `${x}px`
  referenceElement.style.top = `${y}px`
}

const showMyGoButton = (selectedText?: string) => {
  removeMyGoButton()
  const referenceElement = getMousePositionReferenceElement()

  buttonContainer = document.createElement('div')
  buttonContainer.style.zIndex = '1000'

  render(<MyGoButton selectedText={selectedText} />, buttonContainer)

  document.body.appendChild(buttonContainer)

  popperInstance = createPopper(referenceElement, buttonContainer, {
    placement: 'top',
    modifiers: [
      {
        name: 'preventOverflow',
        options: {
          boundary: 'viewport',
        },
      },
      {
        name: 'offset',
        options: {
          offset: [0, 10],
        },
      },
    ],
  })

  if (resizeObserver) {
    resizeObserver.disconnect()
  }
  resizeObserver = new ResizeObserver(() => {
    popperInstance.update()
  })
  resizeObserver.observe(buttonContainer)
}

const removeMyGoButton = () => {
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }
  if (popperInstance) {
    popperInstance.destroy()
    popperInstance = null
  }
  if (buttonContainer) {
    render(null, buttonContainer)
    buttonContainer.remove()
    buttonContainer = null
  }
}

;(window as any).stopCloseMyGoButton = false

let selectionChange = false
document.addEventListener('selectionchange', () => {
  selectionChange = true
})

document.addEventListener('mouseup', async (event: MouseEvent) => {
  if (event.button !== 0) {
    return
  }
  if ((window as any).stopCloseMyGoButton) {
    (window as any).stopCloseMyGoButton = false
    return
  }

  const selection = window.getSelection()
  const selectedText = selection?.toString().trim()

  updateMousePositionReference(event)

  const configManager = useConfigManager()
  const enableAiRecommend = await configManager.getConfig('enableAiRecommend') ?? true

  if (enableAiRecommend && (!buttonContainer || selectionChange) && selectedText) {
    selectionChange = false
    showMyGoButton(selectedText)
  }
  else if (buttonContainer) {
    removeMyGoButton()
    if (window.getSelection) {
      window.getSelection()?.removeAllRanges()
    }
  }
})
