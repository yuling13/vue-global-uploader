import { createStore } from 'vuex'
import createPersistedState from 'vuex-persistedstate'

export default createStore({
  plugins: [createPersistedState()],

  state: {
    globalUploaderVisible: false,
    globalUploaderData: [],
  },

  mutations: {
    INIT_GLOBAL_UPLOADER_DATA (state, payload) {
      state.globalUploaderData = []
    },

    SET_GLOBAL_UPLOADER_VISIBLE (state, payload) {
      state.globalUploaderVisible = payload
    },

    SET_GLOBAL_UPLOADER_DATA (state, payload) {
      if (typeof payload === 'object' && !Array.isArray(payload)) {
        // payload: {
        //   uploadID: 'XXXXXX'(上傳ID),
        //   file: File,
        //   chunkSize: 1 * 1024 * 1024(分塊大小),
        // }
        state.globalUploaderData = [...state.globalUploaderData, payload]
      }
    },
  },
})
