import { render } from 'vue'
import MyGoPanel from '../components/MyGoPanel.vue'
import { createPopper } from '@popperjs/core'
import '.virtual/master.css'

// import { initCSSRuntime } from '@master/css-runtime'
// initCSSRuntime()

let panelContainer: HTMLElement | null = null
let popperInstance: any = null
let referenceElement: HTMLElement | null = null

const showMyGoPanel = (referenceElement: HTMLElement, selectedText?: string) => {
  removeMyGoPanel()

  panelContainer = document.createElement('div')
  panelContainer.style.zIndex = '1000'

  render(<MyGoPanel selectedText={selectedText} />, panelContainer)

  document.body.appendChild(panelContainer)

  popperInstance = createPopper(referenceElement, panelContainer, {
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
}

const removeMyGoPanel = () => {
  if (popperInstance) {
    popperInstance.destroy()
    popperInstance = null
  }
  if (panelContainer) {
    render(null, panelContainer)
    panelContainer.remove()
    panelContainer = null
  }
}

;(window as any).stopCloseMyGoPanel = false

let selectionChange = false
document.addEventListener('selectionchange', () => {
  selectionChange = true
})

document.addEventListener('mouseup', (event: MouseEvent) => {
  if (event.button !== 0) {
    return
  }
  if ((window as any).stopCloseMyGoPanel) {
    (window as any).stopCloseMyGoPanel = false
    return
  }

  const selection = window.getSelection()
  const selectedText = selection?.toString().trim()
  const x = event.clientX + window.scrollX
  const y = event.clientY + window.scrollY

  if (!referenceElement) {
    referenceElement = null
    referenceElement = document.createElement('span')
    referenceElement.style.pointerEvents = 'none'
    referenceElement.style.position = 'absolute'
    referenceElement.style.width = '0px'
    referenceElement.style.height = '0px'
    document.body.appendChild(referenceElement)
  }
  referenceElement.style.left = `${x}px`
  referenceElement.style.top = `${y}px`

  const target = event.target as HTMLElement

  if ((!panelContainer || selectionChange) && selectedText) {
    selectionChange = false
    showMyGoPanel(referenceElement, selectedText)
  }
  else if (!panelContainer && (target.isContentEditable || target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
    showMyGoPanel(referenceElement)
  }
  else {
    removeMyGoPanel()
    if (window.getSelection) {
      window.getSelection()?.removeAllRanges()
    }
  }
})
