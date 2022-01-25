import { ref, computed, watch } from 'vue'
import api from './api'

const deepCopy = (val) => {
  const refList = new WeakMap()
  return _copy(val)

  function _copy (obj) {
    const isArray = Array.isArray(obj)
    const isObject = Object.prototype.toString.call(obj) === '[object Object]'

    if (!isArray && !isObject) return obj
    if (refList.has(obj)) return refList.get(obj)

    const clone = isArray ? [] : {}
    refList.set(obj, clone)

    for (const prop of Object.keys(obj)) clone[prop] = _copy(obj[prop])
    return clone
  }
}

const uploadStatusData = ref({
  uploading: [],
  waiting: [],
  fail: [],
  succeed: [],
})

const uploadActionData = ref({
  uploadID: null,
  isSliceRunning: false,
  chunksDataList: [],
  totalChunks: null,
  progress: 0,
  successfulChunkID: [],
})

const initActionData = () => {
  uploadActionData.value = {
    uploadID: null,
    isSliceRunning: false,
    chunksDataList: [],
    totalChunks: null,
    progress: 0,
    successfulChunkID: [],
  }
}

const setStatusData = ({ dataList, statusData }) => {
  const targetList = deepCopy(dataList)
  for (const item of targetList) {
    const target = {
      ...item,
      status: '等待上傳',
      fileName: item.file.name,
      isRefresh: false,
      isSucceed: false,
    }
    statusData.waiting.push(target)
  }
}

const moveWaitingFileToUpload = async ({ statusData, actionData }) => {
  if (statusData.uploading.length === 0 && statusData.waiting.length !== 0) {
    const targetData = statusData.waiting.shift()
    targetData.status = '準備中'

    statusData.uploading.push(targetData)
    actionData.uploadID = targetData.uploadID

    // 處理上傳分塊
    await handleUploadFileChunk({ data: targetData, actionData: actionData })
    // 開始偵測網路連線和上傳檔案狀態
    handlerCheckNetWork({ action: 'disable' })
    const formData = {
      id: targetData.uploadID,
    }
    handlerCheckNetWork({ action: 'enable', formData: formData, actionData: actionData })
    // 上傳檔案
    await uploadFile({ statusData: statusData, actionData: actionData })
  }
}

// 斷點續傳方法
const resumeUpload = async ({ statusData, actionData }) => {
  let targetData = statusData.uploading[0]
  targetData = {
    ...targetData,
    status: '準備中',
  }

  // 處理上傳分塊
  await handleUploadFileChunk({ data: targetData, actionData: actionData })
  // 開始偵測網路連線和上傳檔案狀態
  handlerCheckNetWork({ action: 'disable' })
  const formData = {
    id: targetData.uploadID,
  }
  handlerCheckNetWork({ action: 'enable', formData: formData, actionData: actionData })
  // 上傳檔案
  await uploadFile({ statusData: statusData, actionData: actionData, type: 'resumable' })
}

// 處理上傳檔案分塊
const handleUploadFileChunk = async ({ data, actionData }) => {
  actionData.isSliceRunning = true

  const targetFile = data.file
  const blobSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice
  const chunkSize = typeof data.chunkSize === 'number' ? data.chunkSize : parseInt(data.chunkSize, 10)
  const chunks = Math.ceil(targetFile.size / chunkSize)

  const chunksDataList = []
  for (let currentChunk = 0; chunks > currentChunk; currentChunk++) {
    const formData = new FormData()
    formData.append('id', data.uploadID)
    formData.append('chunkID', currentChunk + 1)

    // 處理分塊
    const start = currentChunk * chunkSize
    const end = (start + chunkSize) >= targetFile.size ? targetFile.size : start + chunkSize
    const chunkFile = blobSlice.call(targetFile, start, end)
    formData.append('fileChunk', chunkFile)

    const target = {
      data: formData,
      chunkID: currentChunk + 1,
    }
    chunksDataList.push(target)

    if (currentChunk === chunks - 1) {
      actionData.isSliceRunning = false
    }
  }

  if (actionData.isSliceRunning === false) {
    actionData.totalChunks = chunks
    actionData.chunksDataList = chunksDataList
  }
}

const refreshCount = ref(null)
const isNetworkConnect = ref(true)
const isUploading = computed(() => {
  let isUpload = false
  if (uploadStatusData.value.uploading.length === 1) isUpload = true
  return isUpload
})
watch(
  () => isUploading.value,
  (newValue, oldValue) => {
    if (newValue === false && oldValue === true) handlerCheckNetWork({ action: 'disable' })
  })
// 有上傳檔案時，每秒檢測網路連線
const handlerCheckNetWork = ({ action, formData, actionData }) => {
  switch (action) {
    case 'enable':
      refreshCount.value = setTimeout(() => {
        refreshVideoCheckUploadInfo({ action: action, formData: formData, actionData: actionData })
      }, 1000)
      break
    case 'disable':
      clearTimeout(refreshCount.value)
      refreshCount.value = null
      break
  }
}
// 檢查連線與取得分塊上傳資訊
const refreshVideoCheckUploadInfo = async ({ action, formData, actionData }) => {
  const submitData = deepCopy(formData)
  if (!['', null, undefined].includes(submitData.id)) {
    const result = await api.videoCheckUploadInfo({ body: submitData })
    if (result.isSuccess === false && result.data.code === 'unknown') {
      isNetworkConnect.value = false
    } else if (result.isSuccess === true) {
      isNetworkConnect.value = true
      // 確認此時偵測的ID與目前真正在上傳的ID相同
      if (submitData.id === actionData.uploadID) {
        actionData.successfulChunkID = result.data?.chunkID ?? []
        if (actionData.totalChunks !== null) {
          // 進度條
          const progress = Math.floor((actionData.successfulChunkID.length / actionData.totalChunks * 100))
          if (actionData.progress < progress) actionData.progress = progress
        }
      }
    } else if (result.isSuccess === false) {
      isNetworkConnect.value = true
    }
  }
  // 避免非同步延遲，在未上傳時或改為其他影片上傳時，繼續偵測
  if ((isUploading.value === false || (isUploading.value === true && submitData.id !== actionData.uploadID)) && action === 'enable') {
    handlerCheckNetWork({ action: 'disable' })
  } else {
    handlerCheckNetWork({ action: action, formData: formData, actionData: actionData })
  }
}

// 分發上傳檔案
const uploadFile = async ({ statusData, actionData, type = '' }) => {
  if (statusData.uploading.length === 1 && actionData.chunksDataList.length > 0) {
    statusData.uploading[0].status = '上傳中'
    let chunksDataList = actionData.chunksDataList
    let isUploadCompletelySuccess = false
    let isCheckChunksFail = false

    // 斷點續傳＆重傳，檢查檔案上傳情況
    if (type === 'resumable' || statusData.uploading[0].isRefresh === true) {
      const formData = {
        id: actionData.uploadID,
      }
      const result = await api.videoCheckUploadInfo({ body: formData })
      if (result.isSuccess === true) {
        // 檢查是否有分塊已上傳成功
        chunksDataList = chunksDataList.filter(item => {
          const chunkID = item.chunkID
          const chunkIDList = result.data?.chunkID ?? []
          const isNotExist = !chunkIDList.includes(chunkID)
          return isNotExist
        })
      } else {
        isCheckChunksFail = true
      }
    }

    let currentFailChunkList = []
    currentFailChunkList = await sendVideoChunkUpload({ chunks: actionData.totalChunks, chunksDataList: chunksDataList })

    if (currentFailChunkList.length > 0) {
      // 失敗分塊，內部重傳三次
      for (let resend = 1; resend <= 3; resend++) {
        if (currentFailChunkList.length > 0) {
          isCheckChunksFail = false

          // 取得已上傳成功的分塊ID
          const submitData = {
            id: actionData.uploadID,
          }
          const getSuccessChunkIDResult = await api.videoCheckUploadInfo({ body: submitData })

          if (getSuccessChunkIDResult.isSuccess === true) {
            const successChunkIDList = getSuccessChunkIDResult.data?.chunkID ?? []

            // 進度條
            const progress = Math.floor((successChunkIDList.length / actionData.totalChunks * 100))
            if (actionData.progress < progress) actionData.progress = progress

            // 取得失敗分塊數量
            const failChunksNumber = actionData.totalChunks - successChunkIDList.length
            // 取得失敗分塊ID
            const chunksDataList = actionData.chunksDataList.filter(item => {
              const chunkID = item.chunkID
              const isNotSuccessChunk = !successChunkIDList.includes(chunkID)
              return isNotSuccessChunk
            })

            currentFailChunkList = await sendVideoChunkUpload({ chunks: failChunksNumber, chunksDataList: chunksDataList })
          } else {
            isUploadCompletelySuccess = false
            isCheckChunksFail = true
          }
        } else if (currentFailChunkList.length === 0) {
          isUploadCompletelySuccess = true
          break
        }
      }
    } else if (currentFailChunkList.length === 0) {
      isUploadCompletelySuccess = true
    }

    if (isNetworkConnect.value === true) {
      // 網路有連線的狀態下才處理上傳檔案的上傳狀態
      const targetData = statusData.uploading.shift()

      if (Array.isArray(currentFailChunkList) && currentFailChunkList.length === 0 && isUploadCompletelySuccess === true) {
        // 停止偵測
        handlerCheckNetWork({ action: 'disable' })
        // == 上傳成功 ==
        targetData.status = '上傳完成'
        targetData.isRefresh = false
        targetData.isSuccess = true

        statusData.succeed.push(targetData)
      } else if ((!Array.isArray(currentFailChunkList) || currentFailChunkList.length > 0) && isUploadCompletelySuccess === false) {
        //  == 上傳失敗 ==
        targetData.status = '上傳失敗'
        statusData.fail.push(targetData)
      } else if (isCheckChunksFail === true && isUploadCompletelySuccess === false) {
        //  == 網路在線且檢查分塊失敗 ==
        targetData.status = '上傳失敗'
        statusData.fail.push(targetData)
      }

      api.cleanChunkIDList()
      initActionData()
    }
  }
}

// 發送分塊api
const sendVideoChunkUpload = async ({ chunks, chunksDataList }) => {
  const failChunkList = []

  // 一次併發3支api
  const oneTimeRequire = 3
  const loopFrequency = Math.ceil(chunks / 3)

  for (let currentNumber = 0; currentNumber < loopFrequency; currentNumber++) {
    const start = currentNumber * oneTimeRequire
    const end = (start + oneTimeRequire) >= chunks ? chunks : start + oneTimeRequire
    const currentUploadFormDataList = chunksDataList.slice(start, end)
    if (isNetworkConnect.value === true) {
      const result = await Promise.allSettled(currentUploadFormDataList.map(item => {
        const submitData = {
          data: item.data,
          chunkID: item.chunkID,
        }
        const targetAPI = api.videoChunkUpload({ body: submitData })
        return targetAPI
      }))

      for (const item of result) {
        if (item.value?.isSuccess === false) {
          const targetData = item.value.data
          failChunkList.push(targetData)
        }
      }
    }
  }

  return failChunkList
}

export function useFunction () {
  return {
    deepCopy,
    setStatusData,
    moveWaitingFileToUpload,
    handlerCheckNetWork,
    resumeUpload,
    changeFakeNetWorkStatus: api.changeFakeNetWorkStatus,
  }
}

export function useData () {
  return {
    isNetworkConnect,
    isUploading,
    uploadActionData,
    uploadStatusData,
    fakeNetWorkStatus: api.fakeNetWorkStatus,
  }
}
