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
</template>

<script>
import { ref } from 'vue'
import { useStore } from 'vuex'
import { ArrowUp, ArrowDown, Close } from '@element-plus/icons-vue'
export default {
  name: 'global-uploader',

  components: {
    ArrowUp,
    ArrowDown,
    Close,
  },

  setup () {
    // == data ==
    const store = useStore()

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

      // == event ==
      openContain,
      closeUploader,

      // == extra ==
      // icon
      ArrowUp,
      ArrowDown,
      Close,
    }
  },
}
</script>

<style scoped lang="scss">
@import "./style";
</style>
