<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useMyGo, type MyGoUrl } from '../api/my-go'
import { debounce } from 'lodash-es'
import DragScrollBox from './DragScrollBox.vue'

const props = defineProps<{
  keyword?: string
}>()

const {
  search,
  getImageByUrl,
  isLoading,
  error: myGoError,
  clearError: clearMyGoError,
} = useMyGo()

const keyword = ref<string>(props.keyword ?? '')
const myGoUrls = ref<MyGoUrl[] | null>(null)
const selectedImage = ref<string | null>(null)
const error = ref<string | null>(null)

const displayError = computed(() => myGoError.value || error.value)

const findImages = async (keyword: string | null) => {
  if (!keyword?.trim()) {
    return
  }
  myGoUrls.value = null
  selectedImage.value = null
  error.value = null
  clearMyGoError()
  myGoUrls.value = await search(keyword)
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

onMounted(() => {
  if (keyword.value) {
    findImages(keyword.value)
  }
})
</script>
<template>
  <div
    class="flex flex:col overflow:hidden"
  >
    <input
      ref="keywordInputRef"
      v-model="keyword"
      type="text"
      placeholder="Search images..."
      class="r:3! bg:gray-70! color:white! b:none! outline:none! p:8! m:12!"
    />
    <div class="rel flex flex:col flex:1">
      <DragScrollBox
        class="rel flex overflow-x:auto mt:-6 min-h:150 w:full"
        :class="[ (myGoUrls?.length ?? 0) > 1 ? 'cursor:grab cursor:grabbing:active' : '']"
      >
        <div class="flex gap:8 p:8|12">
          <div
            v-for="urlData in myGoUrls"
            :key="urlData.url"
            class="rel flex r:4 user-drag:none user-select:none overflow:hidden
                   transform:scale(1.02):hover transform:scale(.95):active ~transform|.25s|ease
                   width:320 aspect-ratio:16/9
                   skeleton-image"
            @click="(e: Event) => handleImgClick(urlData.url, e)"
          >
            <img
              :src="urlData.thumb || urlData.url"
              :alt="urlData.alt"
              width="320"
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
        v-show="displayError"
        class="abs inset:0 flex center-content p:8|16 pointer-events:none"
      >
        <span class="fg:red">{{ displayError }}</span>
      </div>
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

::-webkit-scrollbar {
    width: 12px;
}

::-webkit-scrollbar-track {
    background: #333333;
}

::-webkit-scrollbar-thumb {
    background-color: #555555;
    border-radius: 10px;
    border: 3px solid #333333;
}

::-webkit-scrollbar-thumb:hover {
    background-color: #777777;
}
</style>
