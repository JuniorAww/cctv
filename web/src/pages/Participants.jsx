import React from 'react'
import TimeAgo from '../utils/timeAgo'

export default function Participants({ users }) {
  const sortedUsers = [...users].sort((a, b) => b.lastSeen - a.lastSeen);

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Участники группы</h2>
      <ul>
        {sortedUsers.map(({ id, name, avatar, lastSeen }) => (
          <li
            key={id}
            className="flex items-center mb-3 border-b pb-2 last:border-b-0"
          >
            <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center mr-3 overflow-hidden">
              {avatar ? (
                <img src={avatar} alt={name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-gray-600">{name[0]}</span>
              )}
            </div>
            <div>
              <div className="font-semibold">{name}</div>
              <div className="text-sm text-gray-500">
                Последний вход: <TimeAgo unixTime={lastSeen}/>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

