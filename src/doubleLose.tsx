// SingleSuccess.tsx
export default function DoubleLose() {
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
            <p>小猫被对方抢走了！</p>
        </div>
    )
}