<template lang="pug">
el-container.layout
  el-main.main
    upload-page
  el-footer.footer
    global-uploader(v-if="isVisibleGlobalUploader")
</template>

<script>
import { computed } from 'vue'
import { useStore } from 'vuex'
import globalUploader from './components/global-uploader.vue'
import uploadPage from './page/upload-page.vue'

export default {
  name: 'App',

  components: {
    globalUploader,
    uploadPage,
  },

  setup () {
    const store = useStore()
    const isVisibleGlobalUploader = computed(() => store.state.globalUploaderVisible)
    return {
      isVisibleGlobalUploader,
    }
  },
}
</script>

<style lang="scss" scoped>
.main {
  height: 100vh;
}
</style>
