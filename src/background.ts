chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
  if (message.action === 'fetchImage') {
    fetch(message.url, { method: 'GET', mode: 'cors', cache: 'no-cache' })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to fetch image, status code: ${response.status}`)
        }
        return response.blob()
      })
      .then((blob) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          sendResponse({ base64Data: reader.result })
        }
        reader.onerror = () => {
          sendResponse({ error: 'Failed to convert image to Base64' })
        }
        reader.readAsDataURL(blob)
      })
      .catch((error) => {
        sendResponse({ error: error.message })
      })
    return true
  }
})
