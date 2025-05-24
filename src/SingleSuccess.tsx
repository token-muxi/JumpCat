// SingleSuccess.tsx
export default function SingleSucess({ time }: { time: number }) {
    return (
        <div style={{
            position: 'absolute',
            top: 0, left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.7)',
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '32px',
            zIndex: 1000
        }}>
            <p>🎉 恭喜你成功拯救了小猫！</p>
            <p style={{ fontSize: '24px', marginTop: '12px' }}>
                用时：{(time / 1000).toFixed(1)} 秒
            </p>
        </div>
    )
}