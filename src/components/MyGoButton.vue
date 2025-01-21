<script setup lang="ts">
import { ref } from 'vue'
import { useGemini } from '../api/gemini'
import { MyGoIcon } from '../images/mygo-icon'
import MyGoPanel from './MyGoPanel.vue'

const props = defineProps<{
  selectedText?: string
}>()

const {
  getResponse,
  isLoading,
  error,
} = useGemini()

const ready = ref(false)
const keyword = ref<string>('')

const handleGoClick = async () => {
  if (props.selectedText) {
    try {
      keyword.value = await getResponse(props.selectedText)
      ready.value = true
    } catch { }
  }
}

const handlePanelMousedown = () => {
  ;(window as any).stopCloseMyGoButton = true
}

const handlePanelMouseup = (e: Event) => {
  if (!(window as any).stopCloseMyGoButton) e.stopPropagation()
}
</script>
<template>
  <div
    class="flex flex:col r:4 min-w:32 min-h:32 max-w:344 b:1|solid|gray-70 bg:gray-90 overflow:hidden"
    @mousedown="handlePanelMousedown"
    @mouseup="handlePanelMouseup"
  >
    <button
      v-show="!ready && !isLoading && !error"
      type="button"
      class="overflow:hidden! w:32! max-w:32! min-w:32! h:32! max-h:32! min-h:32! p:0! m:0! b:none! outline:none! cursor:pointer! r:4!"
      @click.stop="handleGoClick"
    >
      <img
        :src="MyGoIcon"
        width="100%"
        class="pointer-events:none object:contain m:0!"
      />
    </button>
    <div
      v-show="error && !ready"
      class="flex center-content p:8|16 pointer-events:none"
    >
      <span class="fg:red">{{ error }}</span>
    </div>
    <div
      v-show="isLoading && !ready"
      class="abs inset:0 flex center-content"
      @click.stop
    >
      <div class="loading f:16"></div>
    </div>
    <MyGoPanel
      v-if="ready"
      :keyword="keyword"
      class="w:344"
    ></MyGoPanel>
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
