import { ref } from 'vue'
import MyGoLines from '../constants/my-go.json'
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

  // 從 hydra00400 的台詞庫獲取 MyGo 截圖 url 數據
  const searchAnonTokyo = (keyword: string): MyGoUrl[] => {
    const results = MyGoLines.result
      .filter(x => x.text.includes(keyword))
      .map(x => ({
        thumb: `https://cdn.anon-tokyo.com/thumb/thumb/${x.episode}__${x.frame_start}.jpg`,
        url: `https://anon-tokyo.com/image?frame=${x.frame_start}&episode=${x.episode}`,
        alt: x.text,
      }))
    return results
  }

  const search = async (keyword: string): Promise<MyGoUrl[] | null> => {
    const source = await configManager.getConfig('source')
    switch (source) {
      case 'miyago9267':
        return searchMiyago9267(keyword)
      case 'anon-tokyo':
      default:
        return searchAnonTokyo(keyword)
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
    search,
    getImageByUrl,
    isLoading,
    error,
    clearError: () => error.value = null,
  }
}
