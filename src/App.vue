<template lang="pug">
el-container.layout
  el-main.main
    upload-page
  el-footer.footer
    global-uploader
</template>

<script>
import globalUploader from './components/global-uploader.vue'
import uploadPage from './page/upload-page.vue'
export default {
  name: 'App',

  components: {
    globalUploader,
    uploadPage,
  },
}
</script>

<style lang="scss" scoped>
.main {
  height: 100vh;
}
</style>
