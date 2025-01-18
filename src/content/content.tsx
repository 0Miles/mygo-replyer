import { render } from 'vue'
import MyGoButton from '../components/MyGoButton.vue'

let buttonContainer: HTMLElement | null = null

const showSuggestionButton = (x: number, y: number, selectedText: string) => {
  removeSuggestionButton()

  buttonContainer = document.createElement('div')
  buttonContainer.style.position = 'absolute'
  buttonContainer.style.left = `${x + 10}px`
  buttonContainer.style.top = `${y}px`
  buttonContainer.style.zIndex = '1000'

  render(<MyGoButton selectedText={selectedText} />, buttonContainer)

  document.body.appendChild(buttonContainer)
}

const removeSuggestionButton = () => {
  if (buttonContainer) {
    render(null, buttonContainer)
    buttonContainer.remove()
    buttonContainer = null
  }
}

let selectionchangeFlag = false
document.addEventListener('selectionchange', () => {
  selectionchangeFlag = true
})

document.addEventListener('mouseup', (event: MouseEvent) => {
  if (!selectionchangeFlag) {
    return
  }
  selectionchangeFlag = false
  const selection = window.getSelection()
  const selectedText = selection?.toString().trim()

  if (selectedText) {
    const x = event.clientX + window.scrollX
    const y = event.clientY + window.scrollY
    showSuggestionButton(x, y, selectedText)
  } else {
    removeSuggestionButton()
  }
})
