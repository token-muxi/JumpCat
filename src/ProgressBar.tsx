import React from 'react'

interface ProgressBarProps {
    localProgress: number
    remoteProgress: number
}

const ProgressBar: React.FC<ProgressBarProps> = ({ localProgress, remoteProgress }) => {
    return (
        <div
            style={{
                position: 'absolute',
                top: 20,
                left: '50%',
                transform: 'translateX(-50%)',
                width: '60%',
                height: 50,
            }}
        >
            <img
                src="/assets/progress_bar.png"
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'block',
                }}
            />
            <img
                src="/assets/cat_head1.png"
                style={{
                    position: 'absolute',
                    top: '50%',
                    left: `calc(3% + ${localProgress * 94}%)`,
                    transform: 'translate(-50%, -50%)',
                    width: 40,
                    height: 40,
                }}
            />
            <img
                src="/assets/cat_head2.png"
                style={{
                    position: 'absolute',
                    top: '50%',
                    left: `calc(3% + ${remoteProgress * 94}%)`,
                    transform: 'translate(-50%, -50%)',
                    width: 40,
                    height: 40,
                }}
            />
        </div>
    )
}

export default ProgressBar