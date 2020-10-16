export async function fileSend (fileInput) {
  try {
    const response = await fetch('/upload', {
      method: 'POST',
      body: new FormData(fileInput)
    })
    // const res = await response.json()
    // return JSON.parse(res)
    return response.json()
  } catch (err) {
    throw err
  }
}
