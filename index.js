async function fetch_text(uri) {
  resp = await fetch(uri)
  if (resp.status != 200) {
    throw new Error(`fetch of ${resp.url} failed with ${resp.status}`)
  } else {
    return await resp.text()
  }
}

module.exports = {
  fetch_text
}
