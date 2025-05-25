import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import './Prepare.css'
import axios from 'axios'

export default function PrepareRoom() {
    const { roomId, uuid } = useParams()
    const navigate = useNavigate()
    const [roomData, setRoomData] = useState<any>(null)
    const [role, setRole] = useState<'p1' | 'p2' | null>(null)

    useEffect(() => {
        const bgm = new Audio('/assets/choice.wav')
        bgm.loop = true
        bgm.volume = 0.5
        bgm.play().catch(() => {
          document.addEventListener('click', () => bgm.play(), { once: true })
        })

        return () => {
          bgm.pause()
          bgm.currentTime = 0
        }
    }, [])

    useEffect(() => {
        const interval = setInterval(() => {
            axios.get(`https://jumpcat.owo.cab/api/get-room?room=${roomId}`)
                .then(res => {
                    setRoomData(res.data.data)

                    if (res.data.data.p1 === uuid) {
                        setRole('p1')
                    } else if (res.data.data.p2 === uuid) {
                        setRole('p2')
                    }

                    if (res.data.data.p1_ready && res.data.data.p2_ready) {
                        clearInterval(interval)
                        navigate(`/singlegame/${roomId}/${uuid}`)
                    }
                })
                .catch(err => console.error('获取房间失败:', err))
        }, 2000)

        return () => clearInterval(interval)
    }, [roomId, navigate])

    const handleReady = () => {
        if (!role) return
        axios.post('https://jumpcat.owo.cab/api/update-status', {
            room: Number(roomId),
            role
        })
            .then(() => {
                console.log('准备完成')
            })
            .catch(err => {
                console.error('准备失败:', err)
            })
    }

    // 用于渲染某一侧玩家的函数
    const renderPlayer = (playerRole: 'p1' | 'p2') => {
        if (!roomData) return null
        const isCurrentUser = role === playerRole
        const playerId = roomData[playerRole]
        const readyKey = playerRole + '_ready'
        const isReady = roomData[readyKey]

        const avatarSrc = playerRole === 'p1' ? '/assets/cat00.png' : '/assets/catuser2.png'
        const name = isCurrentUser ? '你' : '对手'

        return (
            <div style={{ width: '50vw', textAlign: 'center' ,userSelect: 'none' }}>
                <img src={avatarSrc} alt={name} style={{ width: '150px',userSelect: 'none' }} />
                <p style={{ fontSize: '20px', marginTop: '12px' }}>{name}</p>
                {isCurrentUser && playerId && roomData.p1 && roomData.p2 && !isReady && (
                    <button onClick={handleReady} style={{ marginTop: '20px',userSelect:"none" }}>点击准备</button>
                )}
                {!isCurrentUser && playerId && (
                    <p style={{ fontSize: '20px', marginTop: '12px',userSelect:"none"  }}>
                        {isReady ? '已准备就绪' : '等待准备'}
                    </p>
                )}
                {!playerId && !isCurrentUser && (
                    <p style={{ fontSize: '20px', marginTop: '12px',userSelect:"none"  }}>等待对手加入...</p>
                )}
            </div>
        )
    }

    return (
        <>
            <div className="room-id-display" style={{
                position: 'absolute',
                top: 20,
                left: '50%',
                transform: 'translateX(-50%)',
                color: 'white',
                fontSize: '24px',
                fontWeight: 'bold',
                backgroundColor: 'rgba(0,0,0,0.5)',
                padding: '8px 16px',
                borderRadius: '12px',
                zIndex: 1000,
                userSelect: 'text'
            }}>
                房间号: {roomId}
            </div>
            <div style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '100vw',
                height: '100vh',
                backgroundColor: '#222',
                color: 'white',
                userSelect:"none"
            }}>
                {renderPlayer('p1')}
                {renderPlayer('p2')}
            </div>
        </>
    )
}