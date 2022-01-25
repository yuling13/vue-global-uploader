<template lang="pug">
.global-uploader
  .header
    .header__contain
      .header__contain__title 上傳影片
      .header__contain__button
        el-button.header__button__common(v-show="!isOpen" @click="openContain()" :icon="ArrowUp" type="text")
        el-button.header__button__common(v-show="isOpen"  @click="openContain()" :icon="ArrowDown" type="text")
        el-button.header__button__common(@click="closeUploader()" :icon="Close" type="text")
  .contain(v-show="isOpen")
    div.contain__main
      template(v-if="originalGlobalUploaderData.length > 0")
        div(v-for="(statusDataList, status) in uploadStatusData" :key="status")
          .film-item(v-for="(item, index) in statusDataList" :key="item.uploadID")
            .film-item__title
              .film-item__title__text {{ item.fileName }}
              success-filled.film-item__title__button.succeed-button(v-if="status === 'succeed'")
              el-button.film-item__title__button(:disabled="isUploading" v-else-if="status === 'fail'" :icon="RefreshRight" type="text")
            .film-item__status.is-red(v-if="isNetworkConnect === false") {{ $t('網路連線中斷') }}
            .film-item__status(v-else :class="{ 'is-red': status === 'fail' }") {{ item.status }}
            el-progress(v-if="status === 'uploading' && isNetworkConnect && !['', null, undefined, 0].includes(uploadActionData.totalChunks)" :percentage="uploadActionData.progress")
</template>

<script>
import { ref, computed, watchEffect } from 'vue'
import { ArrowUp, ArrowDown, Close, SuccessFilled, RefreshRight } from '@element-plus/icons-vue'
import { useFunction, useData } from './use-global-upload'
import { useStore } from 'vuex'
export default {
  name: 'global-uploader',

  components: {
    ArrowUp,
    ArrowDown,
    Close,
    SuccessFilled,
    RefreshRight,
  },

  setup () {
    const { deepCopy, setStatusData, moveWaitingFileToUpload } = useFunction()
    const { isNetworkConnect, isUploading, uploadActionData, uploadStatusData } = useData()
    const store = useStore()

    const isInit = ref(false)
    const storeGlobalUploaderData = computed(() => store.state.globalUploaderData)
    const originalGlobalUploaderData = ref([])
    watchEffect(() => {
      if (isInit.value === false && storeGlobalUploaderData.value) {
        isInit.value = true
        originalGlobalUploaderData.value = deepCopy(storeGlobalUploaderData.value)
        // 檢查globalUploaderData內部的檔案型態是否為File
        const checkAllFileTypeList = originalGlobalUploaderData.value.filter(node => {
          return node.file instanceof File
        })
        if (checkAllFileTypeList.length > 0 && checkAllFileTypeList.length === originalGlobalUploaderData.value.length) {
          setStatusData({ dataList: originalGlobalUploaderData.value, statusData: uploadStatusData.value })
        } else {
          store.commit('SET_GLOBAL_UPLOADER_VISIBLE', false)
          store.commit('INIT_GLOBAL_UPLOADER_DATA')
        }
      } else if (isInit.value === true && Array.isArray(storeGlobalUploaderData.value) && storeGlobalUploaderData.value.length > 0 && storeGlobalUploaderData.value.length !== originalGlobalUploaderData.value.length) {
        // 比對是否有新資料
        const oldDataIDList = originalGlobalUploaderData.value.map(node => node.uploadID)
        const newData = storeGlobalUploaderData.value.filter(node => !oldDataIDList.includes(node.uploadID))
        if (newData.length !== 0) {
          setStatusData({ dataList: newData, statusData: uploadStatusData.value })
          originalGlobalUploaderData.value = deepCopy(storeGlobalUploaderData.value)
        }
      }
    })

    // 轉移等待中檔案為上傳檔案
    watchEffect(() => {
      if (uploadStatusData.value.uploading.length === 0 && isNetworkConnect.value === true) moveWaitingFileToUpload({ statusData: uploadStatusData.value, actionData: uploadActionData.value })
    })

    // == event ==
    const isOpen = ref(true)
    const openContain = () => {
      isOpen.value = !isOpen.value
    }

    const closeUploader = () => {
      store.commit('SET_GLOBAL_UPLOADER_VISIBLE', false)
      store.commit('INIT_GLOBAL_UPLOADER_DATA')
    }

    return {
      // == data ==
      isOpen,
      isNetworkConnect,
      isUploading,
      originalGlobalUploaderData,
      uploadStatusData,
      uploadActionData,

      // == event ==
      openContain,
      closeUploader,

      // == extra ==
      // icon
      ArrowUp,
      ArrowDown,
      Close,
      SuccessFilled,
      RefreshRight,

      // debug
    }
  },
}
</script>

<style scoped lang="scss">
@import "./style";
</style>
