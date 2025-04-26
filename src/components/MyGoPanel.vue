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
const displayedUrls = ref<MyGoUrl[]>([])
const selectedImage = ref<string | null>(null)
const error = ref<string | null>(null)
const loadCount = ref<number>(3) // 初始載入數量
const scrollBoxRef = ref<InstanceType<typeof DragScrollBox> | null>(null)
const contentRef = ref<HTMLElement | null>(null)
const imagesCache = ref<Map<string, string>>(new Map()) // 存儲 URL 到 base64 的映射

const displayError = computed(() => myGoError.value || error.value)

const findImages = async (keyword: string | null) => {
  if (!keyword?.trim()) {
    return
  }
  myGoUrls.value = null
  displayedUrls.value = []
  selectedImage.value = null
  error.value = null
  clearMyGoError()
  imagesCache.value.clear()

  myGoUrls.value = await search(keyword)

  if (myGoUrls.value && myGoUrls.value.length > 0) {
    const urls = myGoUrls.value.slice(0, loadCount.value)
    loadImagesForUrls(urls)
    displayedUrls.value = urls
  }
}

const loadImagesForUrls = async (urls: MyGoUrl[]) => {
  for (const urlData of urls) {
    if (!imagesCache.value.has(urlData.url)) {
      loadImageForUrl(urlData.url)
    }
  }
}

const loadImageForUrl = async (url: string) => {
  try {
    const base64 = await getImageByUrl(url)
    if (base64) {
      imagesCache.value.set(url, base64)
    }
  } catch (e) {
    console.error('Failed to load image:', e)
  }
}

const findImagesDebounced = debounce(findImages, 1000)

watch(() => keyword.value, (keyword) => {
  findImagesDebounced(keyword)
})

const copyBase64ToClipboardAsPng = async (base64Image: string) => {
  try {
    const img = new Image()
    img.src = base64Image

    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = err => reject(err)
    })

    const canvas = document.createElement('canvas')
    canvas.width = img.width
    canvas.height = img.height

    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Failed to get 2d context')

    ctx.drawImage(img, 0, 0)

    const pngBase64 = canvas.toDataURL('image/png')

    const byteString = atob(pngBase64.split(',')[1])
    const arrayBuffer = new Uint8Array(byteString.length)
    for (let i = 0; i < byteString.length; i++) {
      arrayBuffer[i] = byteString.charCodeAt(i)
    }
    const blob = new Blob([arrayBuffer], { type: 'image/png' })

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

// 監聽滾動事件，當滾動到80%時載入更多圖片
const handleScroll = debounce((e: Event) => {
  const target = e.target as HTMLElement
  if (!target || !myGoUrls.value) return

  const { scrollLeft, scrollWidth, clientWidth } = target
  const scrollPercentage = (scrollLeft + clientWidth) / scrollWidth

  // 當滾動到80%時載入更多圖片
  if (scrollPercentage > 0.8 && displayedUrls.value.length < myGoUrls.value.length) {
    const nextBatch = myGoUrls.value.slice(
      displayedUrls.value.length,
      displayedUrls.value.length + loadCount.value,
    )
    displayedUrls.value = [...displayedUrls.value, ...nextBatch]
    // 為新加載的 URL 預加載圖片
    loadImagesForUrls(nextBatch)
  }
}, 200)

onMounted(() => {
  if (keyword.value) {
    findImages(keyword.value)
  }

  // 獲取 DragScrollBox 內容元素並添加滾動事件監聽
  if (scrollBoxRef.value) {
    contentRef.value = scrollBoxRef.value.$el
    if (contentRef.value) {
      contentRef.value.addEventListener('scroll', handleScroll)
    }
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
        ref="scrollBoxRef"
        class="rel flex overflow-x:auto mt:-6 min-h:150 w:full"
        :class="[ (myGoUrls?.length ?? 0) > 1 ? 'cursor:grab cursor:grabbing:active' : '']"
      >
        <div class="flex gap:8 p:8|12">
          <div
            v-for="urlData in displayedUrls"
            :key="urlData.url"
            class="rel flex r:4 user-drag:none user-select:none overflow:hidden
                   transform:scale(1.02):hover transform:scale(.95):active ~transform|.25s|ease
                   width:320 aspect-ratio:16/9
                   skeleton-image"
            @click="(e: Event) => handleImgClick(urlData.url, e)"
          >
            <!-- 使用 base64 圖片 -->
            <img
              v-if="imagesCache.get(urlData.url)"
              :src="imagesCache.get(urlData.url)"
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
