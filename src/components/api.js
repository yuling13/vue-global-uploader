
import { ref } from 'vue'

const chunkIDList = ref([])
const fakeNetWorkStatus = ref(true)
const changeFakeNetWorkStatus = (value) => {
  fakeNetWorkStatus.value = value
}

// 檢查影片上傳情況
const videoCheckUploadInfo = ({ body }) => {
  return getCheckUploadInfo({ body: body })
    .then(res => {
      return res
    })
    .catch(err => {
      return err
    })
}
const getCheckUploadInfo = ({ body }) => {
  return new Promise((resolve, reject) => {
    const res = {
      isSuccess: null,
      data: {},
    }
    if (fakeNetWorkStatus.value) {
      res.isSuccess = true
      res.data.chunkID = chunkIDList.value
      setTimeout(() => {
        resolve(res)
      }, 1000)
    } else {
      res.isSuccess = false
      res.data = {
        code: 'unknown',
      }
      setTimeout(() => {
        reject(res)
      }, 1000)
    }
  })
}

// 分塊上傳
const videoChunkUpload = ({ body }) => {
  return uploadVideoChunk({ body: body })
    .then(res => {
      return res
    })
    .catch(err => {
      return err
    })
}
const uploadVideoChunk = ({ body }) => {
  return new Promise((resolve, reject) => {
    const res = {
      isSuccess: null,
    }
    if (fakeNetWorkStatus.value) {
      res.isSuccess = true
      const chunkID = body.chunkID
      chunkIDList.value.push(chunkID)
      setTimeout(() => {
        resolve(res)
      }, 3000)
    } else {
      res.isSuccess = false
      res.data = {
        code: 'unknown',
      }
      setTimeout(() => {
        reject(res)
      }, 1000)
    }
  })
}

const cleanChunkIDList = () => {
  chunkIDList.value = []
}

export default {
  videoCheckUploadInfo,
  videoChunkUpload,
  cleanChunkIDList,
  changeFakeNetWorkStatus,
  fakeNetWorkStatus,
}
