import { useState } from 'react'
import ForestBackground from './ForestBackground'
import './StartScreen-Style.css'
import { useNavigate } from 'react-router-dom'

interface Props {
    onStart: () => void
}

export default function StartScreen({ onStart }: Props) {
    const navigate=useNavigate()
    const [step, setStep] = useState<'init' | 'choose' | 'join'>('init')
    const [roomId, setRoomId] = useState('')

    const handleCreateRoom = () => {
        // TODO: 请求后端创建房间
        console.log('创建房间')
        navigate("/singlegame")
        onStart()
    }

    const handleJoinRoom = () => {
        // TODO: 请求后端加入房间
        console.log('加入房间：' + roomId)
        onStart()
    }

    return (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
            <ForestBackground />
            {step === 'init' && (
                <button className="btn" onClick={() => setStep('choose')}>开始游戏</button>
            )}
            {step === 'choose' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <button className="btn" onClick={handleCreateRoom}>创建房间</button>
                    <button className="btn" onClick={() => setStep('join')}>加入房间</button>
                </div>
            )}
            {step === 'join' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <input
                        type="text"
                        placeholder="请输入房间号"
                        value={roomId}
                        onChange={(e) => setRoomId(e.target.value)}
                    />
                    <button className="btn" onClick={handleJoinRoom}>确认加入</button>
                    <button className="btn" onClick={() => setStep('choose')}>返回</button>
                </div>
            )}
        </div>
    )
}