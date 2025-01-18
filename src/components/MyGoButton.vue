<script setup lang="ts">
import { computed, ref } from 'vue'
import { useGemini } from '../api/gemini'
import { useMyGo, type MyGoUrl } from '../api/my-go'
import { MyGoIcon } from '../images/mygo-icon'

const props = defineProps<{
  selectedText: string
}>()

const { getResponse, isLoading: geminiIsLoading, error: geminiError } = useGemini()
const { fetchMyGoData, getImageByUrl, isLoading: myGoIsLoading, error: myGoError } = useMyGo()

const isLoading = computed(() => geminiIsLoading.value || myGoIsLoading.value)
const myGoUrls = ref<MyGoUrl[] | null>(null)
const selectedImage = ref<string | null>(null)
const error = ref<string | null>(null)

const displayError = computed(() => geminiError.value || myGoError.value || error.value)

const handleGoClick = async () => {
  const keyword = await getResponse(props.selectedText)
  myGoUrls.value = await fetchMyGoData(keyword)
}

async function copyBase64ToClipboardAsPng(base64Image: string) {
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
    if (!ctx) throw new Error('無法獲取 Canvas 渲染上下文')

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

    console.log('JPEG 已成功轉換為 PNG 並複製到剪貼簿！')
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
</script>
<template>
  <div class="flex r:4 min-w:32 min-h:32 max-w:300 max-h:300 overflow-x:auto b:1|solid|gray-70 bg:gray-90">
    <button
      v-if="!isLoading && !myGoUrls?.length && !displayError"
      type="button"
      class="overflow:hidden! w:32! h:32! p:0! m:0! b:none! outline:none!"
      @click="handleGoClick"
    >
      <img
        :src="MyGoIcon"
        width="100%"
        class="pointer-events:none object:contain"
      />
    </button>
    <div
      v-show="isLoading"
      class="abs w:32 h:32 p:8"
    >
      <div class="loading f:16"></div>
    </div>
    <div
      v-if="myGoUrls?.length"
      class="flex flex:col gap:8"
    >
      <div class="flex gap:8 p:8|12">
        <div
          v-for="urlData in myGoUrls"
          :key="urlData.url"
          class="rel flex r:4 overflow:hidden cursor:pointer transform:scale(1.05):hover transform:scale(.95):active ~transform|.25s|ease"
        >
          <img
            :src="urlData.url"
            :alt="urlData.alt"
            width="240"
            @click="(e: Event) => handleImgClick(urlData.url, e)"
          />
          <div
            class="abs inset:0 flex center-content pointer-events:none ~opacity|.3s|ease-in bg:black/.7 opacity:0 img.copied+{opacity:1}"
          >
            <span class="fg:white">Copied!</span>
          </div>
        </div>
      </div>
    </div>
    <div
      v-if="displayError"
      class="flex center-content"
    >
      <span class="fg:red">{{ displayError }}</span>
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
</style>
