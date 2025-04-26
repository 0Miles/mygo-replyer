import { ref } from 'vue'
import { useConfigManager } from '../utils/config-manager'

export type MyGoUrl = {
  thumb?: string
  url: string
  alt: string
}

export const useMyGo = () => {
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const configManager = useConfigManager()

  // 從 tomorin.cc 獲取 MyGo 截圖 url 數據
  const searchTomorinCc = async (keyword: string): Promise<MyGoUrl[] | null> => {
    isLoading.value = true
    error.value = null

    try {
      const apiUrl = `https://api-3.tomorin.cc/public-api/ave-search?keyword=${encodeURIComponent(keyword)}&search_type=both`

      const response = await fetch(apiUrl)
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`API error: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      const result = data?.data.map((item: any) => ({
        url: `https://api-3.tomorin.cc/public-api/ave-frames?episode=${item.episode}&frame_start=${item.frame_start}&frame_end=${item.frame_end}`,
        alt: item.text ?? item.google_gemini_output,
      }))

      return result
    } catch (err: any) {
      error.value = err.message || 'Unknown error'
      return null
    } finally {
      isLoading.value = false
    }
  }

  // 從 miyago9267 獲取 MyGo 截圖 url 數據
  const searchMiyago9267 = async (keyword: string): Promise<MyGoUrl[] | null> => {
    isLoading.value = true
    error.value = null

    try {
      const apiUrl = `https://mygoapi.miyago9267.com/mygo/img?keyword=${encodeURIComponent(keyword)}`

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

  const search = async (keyword: string): Promise<MyGoUrl[] | null> => {
    const source = await configManager.getConfig('source')
    switch (source) {
      case 'miyago9267':
        return searchMiyago9267(keyword)
      case 'tomorin.cc':
      default:
        return searchTomorinCc(keyword)
    }
  }

  const downloadImageAndSaveToStorage = async (url: string): Promise<string | null> => {
    isLoading.value = true
    error.value = null

    try {
      return new Promise<string>((resolve, reject) => {
        chrome.runtime.sendMessage({ action: 'fetchImage', url }, (response) => {
          if (response.error) {
            error.value = response.error
            reject(new Error(response.error))
          } else {
            const base64Data = response.base64Data
            chrome.storage.local.set({ [url]: base64Data }, () => {
              if (chrome.runtime.lastError) {
                reject(new Error('Failed to save image to storage'))
              } else {
                resolve(base64Data)
              }
            })
          }
        })
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
    search,
    getImageByUrl,
    isLoading,
    error,
    clearError: () => error.value = null,
  }
}
