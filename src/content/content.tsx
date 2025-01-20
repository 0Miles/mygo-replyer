import { render } from 'vue'
import MyGoPanel from '../components/MyGoPanel.vue'
import '.virtual/master.css'

// import { initCSSRuntime } from '@master/css-runtime'
// initCSSRuntime()

let panelContainer: HTMLElement | null = null

const showMyGoPanel = (x: number, y: number, selectedText?: string) => {
  removeMyGoPanel()

  panelContainer = document.createElement('div')
  panelContainer.style.position = 'absolute'
  panelContainer.style.left = `${x + 10}px`
  panelContainer.style.top = `${y}px`
  panelContainer.style.zIndex = '1000'

  render(<MyGoPanel selectedText={selectedText} />, panelContainer)

  document.body.appendChild(panelContainer)
}

const removeMyGoPanel = () => {
  if (panelContainer) {
    render(null, panelContainer)
    panelContainer.remove()
    panelContainer = null
  }
}

let selectionchangeFlag = false
document.addEventListener('selectionchange', () => {
  selectionchangeFlag = true
})

;(window as any).stopCloseMyGoPanel = false

document.addEventListener('mouseup', (event: MouseEvent) => {
  if ((window as any).stopCloseMyGoPanel) {
    (window as any).stopCloseMyGoPanel = false
    return
  }
  if (!selectionchangeFlag) {
    return
  }
  selectionchangeFlag = false
  const selection = window.getSelection()
  const selectedText = selection?.toString().trim()
  const x = event.clientX + window.scrollX
  const y = event.clientY + window.scrollY

  const target = event.target as HTMLElement

  if (selectedText) {
    showMyGoPanel(x, y, selectedText)
  }
  else if (!panelContainer && (target.contentEditable || target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
    showMyGoPanel(x, y)
  }
  else {
    removeMyGoPanel()
  }
})
