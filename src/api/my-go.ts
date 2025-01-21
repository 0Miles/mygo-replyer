import { ref } from 'vue'

export type MyGoUrl = {
  url: string
  alt: string
}

export const useMyGo = () => {
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // 獲取 MyGo 數據
  const fetchMyGoData = async (key: string): Promise<MyGoUrl[] | null> => {
    isLoading.value = true
    error.value = null

    try {
      const apiUrl = `https://mygoapi.miyago9267.com/mygo/img?keyword=${encodeURIComponent(key)}`

      const response = await fetch(apiUrl)
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`API error: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      const result = data?.urls

      return result
    } catch (err: any) {
      error.value = err.message || 'Unknown error'
      return null
    } finally {
      isLoading.value = false
    }
  }

  const downloadImageAndSaveToStorage = async (url: string): Promise<string | null> => {
    isLoading.value = true
    error.value = null

    try {
      const response = await fetch(url, { method: 'GET', mode: 'cors', cache: 'no-cache' })
      if (!response.ok) {
        throw new Error(`Failed to fetch image, status code: ${response.status}`)
      }

      const blob = await response.blob()
      const reader = new FileReader()

      return new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
          const base64Data = reader.result as string

          chrome.storage.local.set({ [url]: base64Data }, () => {
            if (chrome.runtime.lastError) {
              reject(new Error('Failed to save image to storage'))
            } else {
              resolve(base64Data)
            }
          })
        }

        reader.onerror = () => {
          reject('Failed to convert image to Base64')
        }

        reader.readAsDataURL(blob)
      })
    } catch (err: any) {
      error.value = err.message || 'Unknown error'
      return null
    } finally {
      isLoading.value = false
    }
  }

  const loadImageFromStorage = (url: string): Promise<string | null> => {
    return new Promise<string | null>((resolve) => {
      chrome.storage.local.get([url], (result) => {
        if (chrome.runtime.lastError) {
          error.value = 'Failed to load image from storage'
          resolve(null)
        } else {
          resolve(result[url] || null)
        }
      })
    })
  }

  const getImageByUrl = async (url: string): Promise<string | null> => {
    try {
      const savedImage = await loadImageFromStorage(url)

      if (savedImage) {
        return savedImage
      } else {
        try {
          return await downloadImageAndSaveToStorage(url)
        } catch {
          error.value = 'Failed to download image'
          return null
        }
      }
    } catch {
      error.value = 'Failed to load image'
      return null
    }
  }

  return {
    fetchMyGoData,
    getImageByUrl,
    isLoading,
    error,
    clearError: () => error.value = null,
  }
}
