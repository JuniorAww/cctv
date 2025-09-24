import React, { useMemo } from 'react'
import TimeAgo from '../utils/timeAgo'
import styles from '../styles'

export default function Participants({ users }) {
    const sortedUsers = useMemo(() => [...users].sort((a, b) => b.lastSeen - a.lastSeen), [users]);
    return (
        <div style={{maxWidth: '800px', margin: '0 auto'}}>
            <div style={styles.card}>
                <ul style={styles.participantList}>
                    {sortedUsers.map(({ id, name, avatar, lastSeen }) => (
                        <li key={id} style={styles.participantListItem}>
                            <div style={styles.participantAvatarContainer}>
                                {avatar ? (
                                    <img src={avatar} alt={name} style={styles.participantAvatarImage} />
                                ) : (
                                    <div style={styles.participantAvatarPlaceholder}>{name[0]}</div>
                                )}
                            </div>
                            <div>
                                <div style={styles.participantName}>{name}</div>
                                <div style={styles.participantLastSeen}>
                                    Был(а) в сети: <TimeAgo unixTime={lastSeen}/>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
