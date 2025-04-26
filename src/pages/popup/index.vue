<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { useConfigManager } from '../../utils/config-manager'
import { geminiModels } from '../../constants/gemini-models'
import { sources } from '../../constants/sources'
import { CollapsibleContent, CollapsibleRoot, CollapsibleTrigger, SwitchRoot, SwitchThumb } from 'radix-vue'
import MyGoPanel from '../../components/MyGoPanel.vue'

const configManager = useConfigManager()

const configModel = reactive<Record<string, any>>({
  geminiApiKey: '',
  enableAiRecommend: true,
  model: geminiModels.default,
  sources: sources.default,
})

const loadKey = async () => {
  try {
    Object.assign(configModel, await configManager.getAllConfigs())
  } catch (error) {
    console.error('Failed to load Gemini Key:', error)
  }
}

const saveKey = async (key: string, value: any) => {
  try {
    await configManager.setConfig(key, value)
  } catch (error) {
    console.error('Failed to save Gemini Key:', error)
  }
}

watch(configModel, (configModel: Record<string, any>) => {
  for (const key in configModel) {
    saveKey(key, configModel[key])
  }
})

const isSettingOpen = ref(false)

loadKey()
</script>
<template>
  <div
    id="app"
    class="bg:gray-90 color:white w:344"
  >
    <MyGoPanel
      embedded
      class="mb:8"
    />
    <CollapsibleRoot
      v-model:open="isSettingOpen"
    >
      <CollapsibleTrigger class="w:full flex jc:space-between bg:gray-90 fg:gray-40 bt:1|solid|gray-60 bb:none bx:none py:4">
        <div>
          Setting
        </div>
        <div>
          {{ isSettingOpen ? '▲' : '▼' }}
        </div>
      </CollapsibleTrigger>

      <CollapsibleContent class="overflow:hidden">
        <div
          class="p:16"
        >
          <div class="flex flex:col gap:8 {fg:gray-30}_label">
            <div class="mx:-4 fg:gray-30">
              <div class="ml:4 flex ai:center jc:space-between">
                <div>
                  AI Recommendation
                </div>
                <SwitchRoot
                  v-model:checked="configModel.enableAiRecommend"
                  class="w:36 h:21 p:2 flex bg:gray-60 rounded rel bg:green-90[data-state='checked'] b:1|solid|gray-80"
                >
                  <SwitchThumb
                    class="block w:15 h:15 bg:white rounded ~transform|.25s translateX(0) will-change:transform translateX(14px)[data-state='checked']"
                  />
                </SwitchRoot>
              </div>
              <div class="bb:1|solid|gray-60 mt:4"></div>
            </div>
            <label>Gemini API Key</label>
            <input
              id="geminiApiKey"
              v-model="configModel.geminiApiKey"
              class="r:3 bg:gray-70 color:white b:none outline:none p:8"
              type="text"
              placeholder="Enter Gemini API Key"
            />

            <label>Model</label>
            <select
              id="model"
              :key="configModel.model"
              v-model="configModel.model"
              class="r:3 bg:gray-70 color:white b:none outline:none p:8"
            >
              <option
                v-for="model in geminiModels.data"
                :key="model"
                :value="model"
              >
                {{ model }}
              </option>
            </select>

            <div class="mt:8 mx:-4 fg:gray-30">
              <div class="ml:4">
                Image
              </div>
              <div class="bb:1|solid|gray-60 mt:4"></div>
            </div>

            <label>Source</label>
            <select
              id="source"
              v-model="configModel.source"
              class="r:3 bg:gray-70 color:white b:none outline:none p:8"
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
      </CollapsibleContent>
    </CollapsibleRoot>
  </div>
</template>
