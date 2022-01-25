
import { ref } from 'vue'

const chunkIDList = ref([])

const videoCheckUploadInfo = ({ body }) => {
  return new Promise((resolve, reject) => {
    const res = {
      isSuccess: true,
      data: {
        chunkID: chunkIDList.value,
      },
    }
    setTimeout(() => {
      resolve(res)
    }, 1000)
  })
}

const videoChunkUpload = ({ body }) => {
  return new Promise((resolve, reject) => {
    const res = {
      isSuccess: true,
    }
    const chunkID = body.chunkID
    chunkIDList.value.push(chunkID)
    setTimeout(() => {
      resolve(res)
    }, 3000)
  })
}

const cleanChunkIDList = () => {
  chunkIDList.value = []
}

export default {
  videoCheckUploadInfo,
  videoChunkUpload,
  cleanChunkIDList,
}
