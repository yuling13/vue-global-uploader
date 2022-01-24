<template lang="pug">
.uploader-page
  el-form
    el-form-item.form-item
      el-upload(
        :file-list="fileList"
        :on-change="handleChange"
        :on-remove="handleRemove"
        :auto-upload="false"
        list-type="text"
        action=""
      )
        el-button(size="small" type="primary") 點擊上傳
        template(#tip)
          .tip 只能上傳mp4文件，檔案小於1GB
</template>

<script>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useStore } from 'vuex'

export default {
  name: 'uploader-page',

  setup () {
    // == data ==
    const store = useStore()
    const fileList = ref([])
    const uploadFile = ref({})

    // verify
    const isCorrectVideo = (file) => {
      let isPass = true

      const formats = ['video/mp4']
      const size = 1 * 1024 * 1024 * 1024
      if (!formats.includes(file.type)) {
        ElMessage.warning('檔案格式不符')
        isPass = false
      }
      if (file.size > size) {
        ElMessage.warning('檔案過大')
        isPass = false
      }

      return isPass
    }

    // == event ==
    const handleChange = (file) => {
      if (isCorrectVideo(file.raw)) {
        fileList.value = [file]
        uploadFile.value = file.raw

        if (uploadFile.value instanceof File) {
          const data = {
            uploadID: Math.floor(Math.random() * 1000) + 1,
            file: uploadFile.value,
            chunkSize: 1 * 1024 * 1024,
          }
          store.commit('SET_GLOBAL_UPLOADER_DATA', data)
          store.commit('SET_GLOBAL_UPLOADER_VISIBLE', true)
        }
      } else {
        fileList.value = []
        uploadFile.value = {}
      }
    }

    const handleRemove = () => {
      fileList.value = []
      uploadFile.value = {}
    }

    return {
      // == data ==
      fileList,
      // == event ==
      handleChange,
      handleRemove,
    }
  },
}
</script>

<style lang="scss" scoped>
.form-item {
  width: 20%;
  min-width: 300px;
}
</style>
