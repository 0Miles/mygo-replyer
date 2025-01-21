<script setup lang="ts">
import { ref } from 'vue'

const contentRef = ref<HTMLElement | null>(null)

const isDragging = ref(false)
let draggingStartX = 0
let draggingStartY = 0
let draggingStartScrollLeft = 0
let draggingStartScrollTop = 0

const handleDraggingMouseDown = (event: MouseEvent) => {
  if (!contentRef.value || event.button !== 0) return
  isDragging.value = true
  draggingStartX = event.pageX
  draggingStartY = event.pageY
  draggingStartScrollLeft = contentRef.value.scrollLeft
  draggingStartScrollTop = contentRef.value.scrollTop
  document.addEventListener('mouseup', handleDraggingMouseUp)
  document.addEventListener('mousemove', handleDraggingMouseMove)
}

const handleDraggingMouseMove = (event: MouseEvent) => {
  event.stopPropagation()
  if (!isDragging.value || !contentRef.value) return
  const x = event.pageX - draggingStartX
  const y = event.pageY - draggingStartY
  contentRef.value.scrollTo({
    left: draggingStartScrollLeft - x,
    top: draggingStartScrollTop - y,
  })
}

const handleDraggingMouseUp = () => {
  isDragging.value = false
  document.removeEventListener('mousemove', handleDraggingMouseMove)
  document.removeEventListener('mouseup', handleDraggingMouseUp)
}
</script>

<template>
  <div
    ref="contentRef"
    class="drop-scroll-box"
    @mousedown="handleDraggingMouseDown"
  >
    <slot></slot>
  </div>
</template>
