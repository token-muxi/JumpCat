import { useEffect, useRef } from 'react'

interface Props {
    offsetY?: number
}

export default function ForestBackground({ offsetY = 0 }: Props) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const width = window.innerWidth
        const height = window.innerHeight
        canvas.width = width
        canvas.height = height

        const layers = [
            { image: new Image(), speed: 0.5, src: '/forest/b1.png' },
            { image: new Image(), speed: 2, src: '/forest/b2.png' },
            { image: new Image(), speed: 4, src: '/forest/b3.png' },
            { image: new Image(), speed: 7, src: '/forest/b4.png' },
            { image: new Image(), speed: 15, src: '/forest/b5.png' },
        ]

        const layerX = [0, -40, -30,-500,0]

        layers.forEach(layer => {
            layer.image.src = layer.src
        })

        let animationId: number

        const draw = () => {
            ctx.clearRect(0, 0, width, height)

            layers.forEach((layer, i) => {
                const img = layer.image
                const x = layerX[i]
                const speed = layer.speed

                ctx.drawImage(img, x, 0, width, height)
                ctx.drawImage(img, x + width, 0, width, height)

                layerX[i] -= speed
                if (layerX[i] <= -width) {
                    layerX[i] = 0
                }
            })

            animationId = requestAnimationFrame(draw)
        }

        Promise.all(
            layers.map(
                layer =>
                    new Promise<void>((resolve) => {
                        layer.image.onload = () => resolve()
                    })
            )
        ).then(() => {
            draw()
        })

        return () => cancelAnimationFrame(animationId)
    }, [])

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                zIndex: -1,
                width: '100vw',
                height: '100vh',
                transform: `translateY(${offsetY}px)`,
                transition: 'transform 0.6s ease',
            }}
        />
    )
}