const formData = new FormData()
    formData.append('image', file)
    const res = await fetch('http://localhost:4001/api/upload', { method: 'POST', body: formData })
    const data = await res.json()
    return data.image
  }
=======
  const uploadImage = async (file) => {
    const formData = new FormData()
    formData.append('image', file)
    const res = await fetch(`${API_URL}/api/upload`, { method: 'POST', body: formData })
    const data = await res.json()
    return data.image
  }
