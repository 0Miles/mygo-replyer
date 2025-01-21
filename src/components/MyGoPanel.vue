<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { useGemini } from '../api/gemini'
import { useMyGo, type MyGoUrl } from '../api/my-go'
import { MyGoIcon } from '../images/mygo-icon'
import { debounce } from 'lodash-es'
import DragScrollBox from './DragScrollBox.vue'

const props = defineProps<{
  selectedText?: string
}>()

const {
  getResponse,
  isLoading: geminiIsLoading,
  error: geminiError,
  clearError: clearGeminiError,
} = useGemini()
const {
  fetchMyGoData,
  getImageByUrl,
  isLoading: myGoIsLoading,
  error: myGoError,
  clearError: clearMyGoError,
} = useMyGo()

const isLoading = computed(() => geminiIsLoading.value || myGoIsLoading.value)

const initFlag = ref(true)

const keywordInputRef = ref<HTMLInputElement | null>(null)
const keyword = ref<string | null>(null)
const myGoUrls = ref<MyGoUrl[] | null>(null)
const selectedImage = ref<string | null>(null)
const error = ref<string | null>(null)

const displayError = computed(() => geminiError.value || myGoError.value || error.value)

const handleGoClick = async () => {
  if (props.selectedText) {
    try {
      keyword.value = await getResponse(props.selectedText)
    } catch { }
  }

  initFlag.value = false

  if (keyword.value === null) {
    keyword.value = ''
  }
  await nextTick()
  keywordInputRef.value?.focus()
}

const findImages = async (keyword: string | null) => {
  if (!keyword?.trim()) {
    return
  }
  myGoUrls.value = null
  selectedImage.value = null
  error.value = null
  clearGeminiError()
  clearMyGoError()
  myGoUrls.value = await fetchMyGoData(keyword)
}
const findImagesDebounced = debounce(findImages, 1000)

watch(() => keyword.value, (keyword) => {
  findImagesDebounced(keyword)
})

const copyBase64ToClipboardAsPng = async (base64Image: string) => {
  try {
    // 解析 Base64 並創建一個圖像對象
    const img = new Image()
    img.src = base64Image

    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = err => reject(err)
    })

    // 創建 Canvas，將 JPEG 圖像繪製到 Canvas 上
    const canvas = document.createElement('canvas')
    canvas.width = img.width
    canvas.height = img.height

    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Failed to get 2d context')

    ctx.drawImage(img, 0, 0)

    // 將 Canvas 內容導出為 PNG Base64
    const pngBase64 = canvas.toDataURL('image/png')

    // 轉換 PNG Base64 為 Blob
    const byteString = atob(pngBase64.split(',')[1])
    const arrayBuffer = new Uint8Array(byteString.length)
    for (let i = 0; i < byteString.length; i++) {
      arrayBuffer[i] = byteString.charCodeAt(i)
    }
    const blob = new Blob([arrayBuffer], { type: 'image/png' })

    // 創建 ClipboardItem 並複製到剪貼簿
    const clipboardItem = new ClipboardItem({ 'image/png': blob })
    await navigator.clipboard.write([clipboardItem])
  } catch {
    error.value = 'Failed to copy image to clipboard'
  }
}

const handleImgClick = async (url: string, e: Event) => {
  selectedImage.value = url
  const base64 = await getImageByUrl(url)
  if (base64) {
    const target = e.target as HTMLElement
    target.classList.add('copied')
    await copyBase64ToClipboardAsPng(base64)
  }
}

const handlePanelMousedown = () => {
  (window as any).stopCloseMyGoPanel = true
}

const handlePanelMouseup = (e: Event) => {
  if (!(window as any).stopCloseMyGoPanel) e.stopPropagation()
}
</script>
<template>
  <div
    class="flex flex:col r:4 min-w:32 min-h:32 max-w:300 max-h:300 b:1|solid|gray-70 bg:gray-90 overflow:hidden"
    @mousedown="handlePanelMousedown"
    @mouseup="handlePanelMouseup"
  >
    <input
      v-show="!initFlag && keyword !== null"
      ref="keywordInputRef"
      v-model="keyword"
      type="text"
      placeholder="Search images..."
      class="r:3! bg:gray-70! color:white! b:none! outline:none! p:8! m:12!"
    />
    <div class="rel flex flex:col flex:1">
      <button
        v-show="initFlag && !geminiIsLoading"
        type="button"
        class="overflow:hidden! w:32! h:32! p:0! m:0! b:none! outline:none! cursor:pointer! r:4!"
        @click="handleGoClick"
      >
        <img
          :src="MyGoIcon"
          width="100%"
          class="pointer-events:none object:contain m:0!"
        />
      </button>
      <div
        v-show="displayError"
        class="abs inset:0 flex center-content p:8|16 pointer-events:none"
      >
        <span class="fg:red">{{ displayError }}</span>
      </div>
      <DragScrollBox
        v-show="!initFlag"
        class="rel flex overflow-x:auto mt:-6 min-h:150 w:264"
      >
        <div class="flex gap:8 p:8|12">
          <div
            v-for="urlData in myGoUrls"
            :key="urlData.url"
            class="rel flex r:4 user-drag:none user-select:none overflow:hidden cursor:pointer
                   transform:scale(1.02):hover transform:scale(.95):active ~transform|.25s|ease
                   width:240 aspect-ratio:16/9
                   skeleton-image"
            @click="(e: Event) => handleImgClick(urlData.url, e)"
          >
            <img
              :src="urlData.url"
              :alt="urlData.alt"
              width="240"
              class="aspect-ratio:16/9 object-fit:cover pointer-events:none"
            />

            <div
              class="abs inset:0 flex center-content pointer-events:none ~opacity|.3s|ease-in bg:black/.7 opacity:0 div.copied>{opacity:1}"
            >
              <span class="fg:white">Copied!</span>
            </div>
          </div>
        </div>
        <div
          v-show="!myGoUrls?.length && !isLoading && !displayError"
          class="abs inset:0 flex center-content pointer-events:none fg:gray-60"
        >
          <span>No images found</span>
        </div>
      </DragScrollBox>
      <div
        v-show="isLoading"
        class="abs inset:0 flex center-content"
        @click.stop
      >
        <div class="loading f:16"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.loading {
    width: 1em;
    height: 1em;
    border: 3px solid #FFF;
    border-bottom-color: transparent;
    border-radius: 50%;
    display: inline-block;
    box-sizing: border-box;
    animation: rotation 1s linear infinite;
}

@keyframes rotation {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

.skeleton-image {
  background: linear-gradient(
    90deg,
    #171717 25%,
    #242424 50%,
    #171717 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.2s infinite linear;
}

@keyframes shimmer {
  0% {
    background-position: 100%;
  }
  100% {
    background-position: -100%;
  }
}
</style>
