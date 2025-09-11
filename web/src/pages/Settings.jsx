import React, { useState, useMemo } from 'react'

export default function Settings({ api, groups, group, onGroupUserChange }) {
  const groupData = useMemo(() => groups.find(x => x.id === group), [ groups, group ])
  const [ name, setName ] = useState(groupData.member.name)
  const [ avatar, setAvatar ] = useState(groupData.member?.avatar || null)
  const [ editing, setEditing ] = useState(false)
  const [ loading, setLoading ] = useState(false)
  const [ error, setError ] = useState(null)

  const onSave = async () => {
    setLoading(true)
    setError(null)
    try {
      // 1. Смена имени
      const resName = await api(`/groups/${group}/member`, true, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      })
      if (!resName.ok) throw new Error('Не удалось сменить имя')

      // 2. Загрузка аватара (если есть)
      let avatarUrl = avatar
      if (avatar && avatar.startsWith('data:image')) {
        const blob = await (await fetch(avatar)).blob()
        const form = new FormData()
        form.append('avatar', blob, 'avatar.jpeg') // лучше jpeg
        const resAvatar = await api(`/groups/${group}/member/avatar`, true, {
          method: 'PATCH', // PATCH работает, если сервер поддерживает
          body: form
        })
        if (!resAvatar.ok) throw new Error('Не удалось загрузить аватар')
        const data = await resAvatar.json()
        avatarUrl = data.url
      }

      onGroupUserChange({ ...groupData.member, name, avatar: avatarUrl })
      setEditing(false)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const onFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const img = document.createElement('img')
    img.src = URL.createObjectURL(file)

    img.onload = () => {
      const MAX_DIM = 512
      let w = img.naturalWidth
      let h = img.naturalHeight

      if (w > h && w > MAX_DIM) { h = (h / w) * MAX_DIM; w = MAX_DIM }
      else if (h >= w && h > MAX_DIM) { w = (w / h) * MAX_DIM; h = MAX_DIM }

      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')
      
      ctx.drawImage(img, 0, 0, w, h)
      
      const data = ctx.getImageData(Math.floor(w/2), Math.floor(h/2), 1, 1).data
      if (data.every(v => v === 0)) console.error('Canvas пустой!')
      
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
      setAvatar(dataUrl)
    }

      img.onerror = () => console.error('Не удалось загрузить изображение')
  }



  return (
    <div className="max-w-md mx-auto">
      {!editing ? (
        <>
          <h2 className="text-lg font-semibold mb-4">Настройки профиля</h2>
          <div className="flex items-center mb-4 space-x-4">
            <div className="w-16 h-16 rounded-full bg-gray-300 overflow-hidden flex items-center justify-center text-xl font-bold">
              {avatar ? <img src={avatar} alt="avatar" className="w-full h-full object-cover" /> : name?.[0]}
            </div>
            <div>
              <p className="text-xl font-semibold">{name}</p>
              <button className="mt-1 text-blue-600 underline" onClick={() => setEditing(true)}>Редактировать</button>
            </div>
          </div>
        </>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); onSave() }} className="bg-white p-4 rounded shadow">
          <label className="block mb-3">Имя
            <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full border rounded px-3 py-2 mt-1" required />
          </label>
          <label className="block mb-4">Аватар
            <input type="file" onChange={onFileChange} accept="image/*" />
          </label>
          {error && <div className="text-red-600 mb-2">{error}</div>}
          <div className="flex space-x-3">
            <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded">{loading ? 'Сохраняем...' : 'Сохранить'}</button>
            <button type="button" onClick={() => setEditing(false)} className="bg-gray-300 px-4 py-2 rounded">Отмена</button>
          </div>
        </form>
      )}
    </div>
  )
}

