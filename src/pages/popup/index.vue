<script setup lang="ts">
import { onMounted, reactive } from 'vue'
import { useConfigManager } from '../../utils/config-manager'
import { geminiModels } from '../../constants/gemini-models'
import { sources } from '../../constants/sources'

const configManager = useConfigManager()

const configModel = reactive<Record<string, string>>({
  geminiApiKey: '',
  model: geminiModels.default,
  sources: sources.default,
})

const loadKey = async () => {
  try {
    configModel.geminiApiKey = await configManager.getConfig('geminiApiKey') || ''
    configModel.model = await configManager.getConfig('model') || geminiModels.default
    configModel.source = await configManager.getConfig('source') || sources.default
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
        <option
          v-for="model in geminiModels.data"
          :key="model"
          :value="model"
        >
          {{ model }}
        </option>
      </select>

      <label>Source</label>
      <select
        id="source"
        v-model="configModel.source"
        class="r:3 bg:gray-70 color:white b:none outline:none p:8"
        @change="saveKey('source')"
      >
        <option
          v-for="source in sources.data"
          :key="source"
          :value="source"
        >
          {{ source }}
        </option>
      </select>
    </div>
  </div>
</template>
