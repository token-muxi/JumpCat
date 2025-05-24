import { useState } from 'react'
import ForestBackground from './ForestBackground'
import './StartScreen-Style.css'
import { useNavigate } from 'react-router-dom'

interface Props {
    onStart: () => void
}

export default function StartScreen({ onStart }: Props) {
    const navigate=useNavigate()
    const [step, setStep] = useState<'init' | 'choose' | 'join' | 'about'>('init')
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <button className="btn" onClick={() => setStep('choose')}>开始游戏</button>
                    <button className="btn" onClick={() => setStep('about')}>关于游戏</button>
                </div>
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
            {step === 'about' && (
                <div style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.6)',
                  padding: '20px 30px',
                  borderRadius: '10px',
                  maxWidth: '520px',
                  textAlign: 'center',
                    fontSize: '24px',
                }}>
                  <p style={{ marginBottom: '28px' }}>
                    欢迎来到《JumpCat》！
                  </p>
                    <p>
                        你将控制一只可爱的猫咪在沙滩跳跃，
                        避免危险螃蟹，与朋友比拼谁先到达终点，拯救小猫。
                    </p>
                    <p>
                        点击“开始游戏”以创建或加入房间。
                    </p>
                  <button className="btn" onClick={() => setStep('init')}>返回</button>
                </div>
            )}
        </div>
    )
}