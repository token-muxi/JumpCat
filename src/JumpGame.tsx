import { useEffect, useRef, useState } from 'react'
import ProgressBar from './ProgressBar'
import SingleSucess from './SingleSuccess'
import { useNavigate } from 'react-router-dom'
const TILE_SIZE = 80//每个格子长度
const BOX_SIZE = 150//物体长度
const MAP_LENGTH = 1000//地图总长度
const tileCount = Math.floor(MAP_LENGTH / TILE_SIZE)
function generateRedZones(tileCount: number): { start: number; end: number }[] {
    const zones: { start: number; end: number }[] = []
    let current = 2 // 从第2格开始生成，留出起点

    while (current < tileCount - 2) {
        const length = 1 + Math.floor(Math.random() * 3) // 1~3格
        if (current + length >= tileCount - 1) break

        zones.push({ start: current, end: current + length - 1 })

        // 至少间隔 1 格，最多间隔 3 格
        current += length + 3 + Math.floor(Math.random() * 4)
    }

    return zones
}

const redZones = generateRedZones(tileCount)

const canvasWidth = window.innerWidth;
const canvasHeight = window.innerHeight;
const bottomHeight = window.innerHeight*0.2;
const platformBaseY = canvasHeight - bottomHeight;
const boxFixedX = 100

export default function JumpGame() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const [boxX, setBoxX] = useState(0)
    const [success,setSucess]=useState(false)
    const [finalTime,setFinalTime]=useState<number>(0)
    const [time,setTime]=useState<number>(0)
    const timeRef=useRef<number>(0)
    const grassImg = new Image()
    grassImg.src = '/assets/grass.png'

    const spikeImg = new Image()
    spikeImg.src = '/assets/spike2.png'

    const catImg = new Image()
    catImg.src = '/assets/cat00.png'

    const catIdleImgs = Array.from({ length: 6 }, (_, i) => {
        const img = new Image()
        img.src = `/assets/cat0${i}.png`
        return img
    })

    const cat1Img = new Image()
    cat1Img.src = '/assets/cat1.png'

    const cat2Img = new Image()
    cat2Img.src = '/assets/cat2.png'

    const PLATFORM_HEIGHT = TILE_SIZE;//平台高度

    // Load goal image
    const goalImg = new Image()
    goalImg.src = '/assets/box.png'

    const goalReachedImg = new Image()
    goalReachedImg.src = '/assets/box1.png'

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        let animationFrameId: number
        let goalReached = false

        const box = {
            x: 0,
            y: platformBaseY-TILE_SIZE-BOX_SIZE+10,
            width: BOX_SIZE,
            height: BOX_SIZE,
            vy: 0,
            vx: 0,
            gravity: 1.5,
            isJumping: false,
            isCharging: false,
            chargeStart: 0,
            maxCharge: 500,
            minCharge: 100,
            isBouncingBack: false,
        }

        const getPlatformUnderBox = () => {
            const boxLeftTile = Math.floor((box.x+BOX_SIZE*0.2) / TILE_SIZE)
            const boxRightTile = Math.floor((box.x + box.width -BOX_SIZE*0.3) / TILE_SIZE)
            for (const zone of redZones) {
                if (boxRightTile >= zone.start && boxLeftTile <= zone.end) {
                    return { color: 'red' }
                }
            }
            return { color: 'green' }
        }
        const startTimer=()=>{
            timeRef.current=window.setInterval(()=>{
                setTime(pre=>pre+100)
            },100)
        }
        const stopTimer=()=>{
            clearInterval(timeRef.current)
        }
        const drawBox = () => {
            let chargeTime = box.isCharging ? Date.now() - box.chargeStart : 0
            chargeTime = Math.min(chargeTime, box.maxCharge)
            const scale = 1 - 1.5 * (chargeTime / box.maxCharge)
            const h = Math.max(BOX_SIZE/3, box.height * scale)
            const offsetY = box.height - h

            const shadowWidth = box.width * 0.9
            const maxShadowHeight = 15
            const minShadowHeight = 5
            let shadowHeight = Math.max(minShadowHeight, maxShadowHeight - box.y / 15)

            const shadowX = boxFixedX + box.width / 2.2
            const shadowY = platformBaseY - TILE_SIZE + 10



            let imgToDraw = catImg // fallback

            if (!box.isJumping  && !box.isBouncingBack) {
                const index = Math.floor(Date.now() / 150) % 6 // 每150ms切换一帧，共6帧
                imgToDraw = catIdleImgs[index]
            } else if (box.isJumping) {
                imgToDraw = box.y > platformBaseY - TILE_SIZE - BOX_SIZE - 50 ? cat1Img : cat2Img
                shadowHeight = Math.max(minShadowHeight, maxShadowHeight - box.y / 15)
            }

            ctx.beginPath()
            ctx.ellipse(shadowX, shadowY, shadowWidth / 2, shadowHeight, 0, 0, Math.PI * 2)
            ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'
            ctx.fill()

            ctx.drawImage(imgToDraw, boxFixedX, box.y + offsetY, box.width, h)
        }

        const drawPlatforms = () => {
            const offsetX = box.x - boxFixedX
            const tilesInView = Math.ceil(canvasWidth / TILE_SIZE) + 2
            const startTile = Math.floor(offsetX / TILE_SIZE) - 1
            ctx.drawImage(grassImg, 0, platformBaseY-TILE_SIZE, canvasWidth, PLATFORM_HEIGHT)
            for (let i = 0; i < tilesInView; i++) {
                const tileX = (startTile + i) * TILE_SIZE - offsetX
                ctx.drawImage(grassImg, tileX, platformBaseY-TILE_SIZE, TILE_SIZE, TILE_SIZE)
            }

            for (const zone of redZones) {
                for (let pos = zone.start; pos <= zone.end; pos++) {
                    const tileX = pos * TILE_SIZE - offsetX
                    ctx.drawImage(spikeImg, tileX, platformBaseY-TILE_SIZE, TILE_SIZE, TILE_SIZE)
                }
            }

            // Draw goal box at the end
            const goalDrawX = MAP_LENGTH - offsetX
            const goalImageToUse = goalReached ? goalReachedImg : goalImg
            ctx.drawImage(goalImageToUse, goalDrawX, platformBaseY - TILE_SIZE - 55, TILE_SIZE * 1.6, TILE_SIZE)
        }

        const update = () => {
            ctx.clearRect(0, 0, canvasWidth, canvasHeight)

            if (box.isJumping || box.isBouncingBack) {
                box.vy += box.gravity
                box.y += box.vy
                box.x += box.vx
                // Clamp box.x to right boundary
                if (box.x + box.width >= MAP_LENGTH) {
                    box.x = MAP_LENGTH - box.width
                }
                setBoxX(box.x);

                if (box.x + box.width >= MAP_LENGTH && box.vx > 0) {
                    box.vx = 0
                    goalReached = true
                }

                if (box.y >= platformBaseY - TILE_SIZE - BOX_SIZE+10) {
                    box.y = platformBaseY - TILE_SIZE - BOX_SIZE+10
                    box.vy = 0

                    const currentPlatform = getPlatformUnderBox()
                    if (currentPlatform.color === 'red') {
                        box.vx = -15
                        box.vy = -15
                        box.isBouncingBack = true
                        box.isJumping = true
                    } else {
                        box.vx = 0
                        box.isJumping = false
                        box.isBouncingBack = false
                    }
                }
            }

            ctx.fillStyle = '#484037'  // 褐色 SaddleBrown
            ctx.fillRect(0, platformBaseY-TILE_SIZE/10, canvasWidth, 500)


            drawPlatforms()
            drawBox()

            animationFrameId = requestAnimationFrame(update)
        }

        const keyDownHandler = (e: KeyboardEvent) => {
            if (
                e.code === 'KeyJ' &&
                !box.isJumping &&
                !box.isCharging &&
                !box.isBouncingBack
            ) {
                box.isCharging = true
                box.chargeStart = Date.now()
            }
        }

        const keyUpHandler = (e: KeyboardEvent) => {
            if (e.code === 'KeyJ' && box.isCharging && !box.isBouncingBack) {
                box.isCharging = false
                let chargeTime = Date.now() - box.chargeStart

                chargeTime = Math.min(chargeTime, box.maxCharge)
                chargeTime = Math.max(chargeTime, box.minCharge)

                const powerRatio = chargeTime / 400
                console.log('powerRatio', powerRatio);
                box.vy = -25 * powerRatio
                box.vx = 13 * powerRatio
                box.isJumping = true
            }
        }

        document.addEventListener('keydown', keyDownHandler)
        document.addEventListener('keyup', keyUpHandler)
        update()
        startTimer()
        return () => {
            stopTimer()
            cancelAnimationFrame(animationFrameId)
            document.removeEventListener('keydown', keyDownHandler)
            document.removeEventListener('keyup', keyUpHandler)
        }
    }, [])
    useEffect(()=>{
        if(success){
            setFinalTime(time)
        }
    },[success])
    return (
        
        <div style={{ width: '100vw', height: '100vh', background: '#dfdb91' }}>
            {success?<SingleSucess time={finalTime}/>:<div>
                <ProgressBar localProgress={Math.min(1, boxX / MAP_LENGTH)} remoteProgress={0.5} />
                <div >{time/1000}</div>
                <canvas
                    ref={canvasRef}
                    width={canvasWidth}
                    height={canvasHeight}
                    style={{
                        display: 'block',
                        margin: '0 auto',
                        border: '1px solid #333',
                    }}
                />
            </div>}
            
        </div>
    )
}