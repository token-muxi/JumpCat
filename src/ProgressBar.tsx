import React from 'react'

interface ProgressBarProps {
    localProgress: number
    remoteProgress: number
}

const ProgressBar: React.FC<ProgressBarProps> = ({ localProgress, remoteProgress }) => {
    return (
        <div style={{
            position: 'absolute',
            top: 20,
            left: 0,
            width: '100%',
            height: 20,
            background: '#ea3737'
        }}>
            <div style={{
                position: 'absolute',
                top: '50%',
                left: `${localProgress * 100}%`,
                transform: 'translate(-50%, -50%)',
                width: 12,
                height: 12,
                background: 'blue',
                borderRadius: '50%'
            }} />
            <div style={{
                position: 'absolute',
                top: '50%',
                left: `${remoteProgress * 100}%`,
                transform: 'translate(-50%, -50%)',
                width: 12,
                height: 12,
                background: 'green',
                borderRadius: '50%'
            }} />
        </div>
    )
}

export default ProgressBar