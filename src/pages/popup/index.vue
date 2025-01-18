<script setup lang="ts">
import { onMounted, reactive } from 'vue'
import { useConfigManager } from '../../utils/config-manager'
import MyGoButton from '../../components/MyGoButton.vue'

console.log(MyGoButton)
const configManager = useConfigManager()

const configModel = reactive<Record<string, string>>({
  geminiApiKey: '',
  model: 'gemini-1.5-pro',
})

const loadKey = async () => {
  try {
    const key = await configManager.getConfig('geminiApiKey')
    const model = await configManager.getConfig('model')
    configModel.geminiApiKey = key || ''
    configModel.model = model || 'gemini-1.5-pro'
  } catch (error) {
    console.error('Failed to load Gemini Key:', error)
  }
}

const saveKey = async (key: string) => {
  try {
    await configManager.setConfig(key, configModel?.[key]?.trim())
  } catch (error) {
    console.error('Failed to save Gemini Key:', error)
  }
}

onMounted(() => {
  loadKey()
})
</script>
<template>
  <div
    id="app"
    class="bg:gray-90 p:16 color:white"
  >
    <div class="flex flex:col gap:8 w:300 {fg:gray-30}_label">
      <label>Gemini API Key</label>
      <input
        id="geminiApiKey"
        v-model="configModel.geminiApiKey"
        class="r:3 bg:gray-70 color:white b:none outline:none p:8"
        type="text"
        placeholder="Enter Gemini API Key"
        @input="saveKey('geminiApiKey')"
      />

      <label>Model</label>
      <select
        id="model"
        v-model="configModel.model"
        class="r:3 bg:gray-70 color:white b:none outline:none p:8"
        @change="saveKey('model')"
      >
        <option value="gemini-1.5-pro">
          gemini-1.5-pro
        </option>
        <option value="gemini-1.5-flash">
          gemini-1.5-flash
        </option>
        <option value="gemini-1.5-flash-8b">
          gemini-1.5-flash-8b
        </option>
        <option value="gemini-2.0-flash-exp">
          gemini-2.0-flash-exp
        </option>
        <option value="gemini-exp-1206">
          gemini-exp-1206
        </option>
        <option value="gemini-2.0-flash-thinking-exp-1219">
          gemini-2.0-flash-thinking-exp-1219
        </option>
        <option value="learnlm-1.5-pro-experimental">
          learnlm-1.5-pro-experimental
        </option>
        <option value="learnlm-1.5-pro-experimental">
          learnlm-1.5-pro-experimental
        </option>
      </select>
    </div>
  </div>
</template>
