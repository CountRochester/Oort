export async function fileSend (fileInput) {
  try {
    const response = await fetch('/upload', {
      method: 'post',
      body: new FormData(fileInput)
    })
    const res = await response.json()
    return JSON.parse(res)
  } catch (err) {
    throw err
  }
}
