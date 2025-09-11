import React, { useMemo, useState, useEffect, useRef } from 'react'

const quotes = [
[
"❝Чем дальше от понедельника, тем добрее утро.❞",
"❝Мне известно, что понедельник начинается в субботу.❞",
"❝— Мне не встать. Понедельник наступил.... прямо на меня.❞",
],
[
"❝Ну а какая разница — вторник или пятница? Когда навстречу тебе улыбаются!❞",
"❝Ни что так не портит пятницу, как осознание того, что сегодня вторник❞",
"❝Вторник — для новостей.❞",
"❝In coffee, there seems to be a new trend every Tuesday❞",
],
[
"❝Время делает шаг… вторник убивает среда.❞",
"❝Среда непременно должна быть цветочной, с лёгким привкусом шоколада и поцелуев.❞",
"❝Среда пришла — неделя прошла.❞",
"❝Среда длиннее пятницы❞",
],
[
"❝Если вы четвертый день не высыпаетесь, значит, сегодня четверг!❞",
"❝Хорошо, что завтра пятница, а не после завтра, как вчера.❞",
"❝После дождичка в четверг обычно бывает дождичек в пятницу.❞",
"❝Четверг рыбный день - пойду раздам лещей.❞",
],
[
"❝Пятница хоть и не большой праздник, зато постоянный❞",
"❝Чувствуете? Выходными пахнет!❞",
"❝Friday is my second favorite F word.❞",
"❝Пятница! Время создавать истории, о которых вы будете вспоминать в понедельник.❞",
],
[
"❝Суббота — день отдыха для души и тела.❞",
"❝Saturday is for adventures, Sundays are for cuddling.❞",
"❝Суббота — день для спа. Расслабься, побалуй себя, наслаждайся и люби себя.❞",
"❝Субботний вечер идеален для писателей, потому что все остальные развлекаются.❞",
],
[
"❝Воскресенье должно приходить с кнопкой паузы.❞",
"❝Sunday clears away the rust of the whole week.❞",
"❝Воскресенье — золотой замок, скрепляющий книгу недели.❞",
]
]

export default function Dashboard({ users, cameras }) {
  const now = Date.now()
  
  const quote = useMemo(() => {
      console.log(quotes)
      const dayQuotes = quotes[(new Date().getDay() + 6) % 7]
      console.log(dayQuotes)
      return dayQuotes[Math.floor(Math.random() * dayQuotes.length)]
  }, [])
  
  const recent10m = users?.filter(u => now - new Date(+u.lastSeen).getTime() < 10*60*1000) ?? []
  const recent1h  = users?.filter(u => now - new Date(+u.lastSeen).getTime() < 60*60*1000) ?? []
  const recent1d  = users?.filter(u => now - new Date(+u.lastSeen).getTime() < 24*60*60*1000) ?? []
  const newUsers  = users?.filter(u => now - new Date(+u.createdAt).getTime() < 24*60*60*1000) ?? []

  return (
    <div className="flex flex-col items-center space-y-6">
      <h2 className="text-1xl font-bold">{ quote }</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        <div className="bg-white shadow rounded-lg p-4">
          <h3 className="font-semibold mb-2">Камеры</h3>
          <ul className="space-y-1">
            {!cameras?.length ? "Камеры не добавлены" : cameras?.map(cam => {
              console.log(cam)
              return (
              <li key={cam.id} className="flex justify-between">
                <span>{cam.name}</span>
                <span className={cam.ready ? "text-green-600" : "text-red-600"}>
                  {cam.ready ? "Готова" : "Недоступна"}
                </span>
              </li>)
            })}
          </ul>
        </div>

        <div className="bg-white shadow rounded-lg p-4">
          <h3 className="font-semibold mb-2">Участники</h3>
          <p>В группе:<span className="font-bold"> {users?.length ?? 0}</span> чел.</p>
          <p>Активные за 10 минут: <span className="font-bold">{recent10m.length}</span> чел.</p>
          <p>Активные за последний час:<span className="font-bold"> {recent1h.length}</span> чел.</p>
          <p>Активные за последний день:<span className="font-bold"> {recent1d.length}</span> чел.</p>
          <p>Новые участники:<span className="font-bold"> {newUsers.length}</span> чел.</p>
        </div>
      </div>
    </div>
  )
}

