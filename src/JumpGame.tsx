import { useEffect, useRef, useState } from 'react'
import ProgressBar from './ProgressBar'
import SingleSucess from './SingleSuccess'
// import { useNavigate } from 'react-router-dom'
import { useParams } from 'react-router-dom'
import DoubleLose from "./doubleLose.tsx";
const TILE_SIZE = 80//每个格子长度
const CAT_SIZE = 150//物体长度
const BOX_SIZE = TILE_SIZE*1.6

const canvasWidth = window.innerWidth;
const canvasHeight = window.innerHeight;
const bottomHeight = window.innerHeight*0.2;
const platformBaseY = canvasHeight - bottomHeight;
const boxFixedX = window.innerWidth/3

const bgm = new Audio('/assets/wave.mp3')
bgm.volume = 1
bgm.currentTime = 0


function generateRandomZones(tileCount: number ) {
    const zones: { start: number; end: number }[] = []
    let current = 6

    while (current<tileCount-2) {
        const length = 1+Math.floor(Math.random()*3)
        if(current + length >= tileCount-1) break
        zones.push({start:current,end:current+length-1})
        current += length+2+Math.floor(Math.random()*2)
    }
    return zones
}
let lastZone = generateRandomZones(60)
let MAP_LENGTH = 4800;

const backgroundImg = new Image()
backgroundImg.src = '/assets/sea.png'

const seaLayers = Array.from({ length: 3 }, (_, i) => {
    const img = new Image()
    img.src = `/assets/sea${i + 1}.png`
    return img
})

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

const cathurt1Img = new Image()
cathurt1Img.src = '/assets/cathurt1.png'

const cathurt2Img = new Image()
cathurt2Img.src = '/assets/cathurt2.png'

const cat2Img = new Image()
cat2Img.src = '/assets/cat2.png'

const PLATFORM_HEIGHT = TILE_SIZE;//平台高度

// Load goal image
const goalImg = new Image()
goalImg.src = '/assets/box.png'

const goalReachedImg = new Image()
goalReachedImg.src = '/assets/box1.png'

async function fetchMapData(roomId: string) {
  try {
    const res = await fetch(`https://jumpcat.owo.cab/api/get-room?room=${roomId}`)
    const data = await res.json()
    if (data.code === 200 && data.data?.map) {
      return {
        length: data.data.map.length,
        zones: data.data.map.locations
      }
    }
  } catch (err) {
    console.error('地图加载失败:', err)
  }
  return null
}
export default function JumpGame() {
    const { roomId, uuid } = useParams<{ roomId: string; uuid: string }>()
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const [boxX, setBoxX] = useState(0)
    const [time, setTime] = useState<number>(0)
    const timeRef = useRef<number>(0)
    const [success, setSuccess] = useState(false)
    const [remoteProgress, setRemoteProgress] = useState(-1)
    const [isWin, setIsWin] = useState(false)
    const [isLose, setIsLose] = useState(false)
    bgm.play()
    // const [finalTime,setFinalTime]=useState<number>(0)
    useEffect(() => {
        if (roomId !== '0' && uuid) {
          fetchMapData(roomId).then(result => {
            if (result) {
              if (result.zones.length > 0) {
                lastZone = result.zones
                  MAP_LENGTH = result.length*TILE_SIZE
              }
              drawPlatforms()
              console.log(result)
            }
          })
        }

        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        timeRef.current = window.setInterval(() => {
            setTime(t => t + 100)
        }, 100)

        const hurtSound = new Audio('/assets/hurt.mp3')
        const miaoSound = new Audio('/assets/miao.mp3')
        hurtSound.preload = 'auto'
        miaoSound.preload = 'auto'
        hurtSound.volume = 0.8 // 可调节音量
        miaoSound.volume = 0

        let animationFrameId: number
        let goalReached = false

        const box = {
            x: 0,
            y: platformBaseY-TILE_SIZE-CAT_SIZE+10,
            width: CAT_SIZE,
            height: CAT_SIZE,
            vy: 0,
            vx: 0,
            gravity: 0.5,
            isJumping: false,
            isCharging: false,
            chargeStart: 0,
            maxCharge: 400,
            minCharge: 100,
            isBouncingBack: false,
        }

        let ws: WebSocket | null = null
        if (roomId != '0' && uuid) {
          ws = new WebSocket(`wss://jumpcat.owo.cab/api/game-connect?room=${roomId}&player=${uuid}`)
          ws.onmessage = (event) => {
            try {
              const msg = JSON.parse(event.data)
              if (msg.location !== undefined) {
                setRemoteProgress(msg.location)
                  const localProgress = box.x / MAP_LENGTH
                  if (msg.location >= 0.99 && localProgress < 1 && !success && !isWin && !isLose) {
                      setIsLose(true)
                      if (ws) ws.close()
                  }
              }
            } catch (e) {
              console.error('Invalid WS message:', event.data)
            }
          }
        }

        const getPlatformUnderBox = () => {
            const boxLeftTile = Math.floor((box.x+CAT_SIZE*0.2) / TILE_SIZE)
            const boxRightTile = Math.floor((box.x + box.width -CAT_SIZE*0.3) / TILE_SIZE)
            for (const zone of lastZone) {
                if (boxRightTile >= zone.start && boxLeftTile <= zone.end) {
                    return { color: 'red' }
                }
            }
            return { color: 'green' }
        }
        const drawCat = () => {
            let chargeTime = box.isCharging ? Date.now() - box.chargeStart : 0
            chargeTime = Math.min(chargeTime, box.maxCharge)
            const scale = 1 - 1.5 * (chargeTime / box.maxCharge)
            const h = Math.max(CAT_SIZE/3, box.height * scale)
            const offsetY = box.height - h

            const shadowWidth = box.width - (platformBaseY-box.y)/4
            const maxShadowHeight = 15
            const minShadowHeight = 5
            let shadowHeight = Math.max(minShadowHeight, maxShadowHeight - box.y / 15)

            const shadowX = boxFixedX + box.width / 2.2
            const shadowY = platformBaseY - TILE_SIZE + 10

            let imgToDraw = catImg // fallback

            if (!box.isJumping  && !box.isBouncingBack) {
                const index = Math.floor(Date.now() / 150) % 6 // 每150ms切换一帧，共6帧
                imgToDraw = catIdleImgs[index]
            } else if (box.isJumping && !box.isBouncingBack) {
                imgToDraw = box.y > platformBaseY - TILE_SIZE - CAT_SIZE - 70 ? cat1Img : cat2Img
                shadowHeight = Math.max(minShadowHeight, maxShadowHeight - box.y / 15)
            }else if (box.isJumping && box.isBouncingBack) {
                imgToDraw = box.y > platformBaseY - TILE_SIZE - CAT_SIZE - 70 ? cathurt1Img : cathurt2Img
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

            for (const zone of lastZone) {
                for (let pos = zone.start; pos <= zone.end; pos++) {
                    const tileX = pos * TILE_SIZE - offsetX
                    ctx.drawImage(spikeImg, tileX, platformBaseY-TILE_SIZE*1.5, TILE_SIZE, TILE_SIZE)
                }
            }

            const goalDrawX = MAP_LENGTH - offsetX+BOX_SIZE
            const goalImageToUse = goalReached ? goalReachedImg : goalImg
            ctx.drawImage(goalImageToUse, goalDrawX, platformBaseY - TILE_SIZE - 55, BOX_SIZE, TILE_SIZE)
        }

        let miaoPlayed = false

        const update = () => {

            if (ws && ws.readyState == WebSocket.OPEN) {
                ws.send(JSON.stringify({ location: Math.min(1, box.x / MAP_LENGTH) }))
            }
            if (box.isJumping || box.isBouncingBack) {
                box.vy += box.gravity
                box.y += box.vy
                box.x += box.vx


                setBoxX(box.x)


                if (box.x >= MAP_LENGTH && box.vx > 0) {
                    box.vx = 0
                    goalReached = true
                    box.x = MAP_LENGTH
                    if (!success && !miaoPlayed) {
                        setSuccess(true)
                        if (ws && ws.readyState == WebSocket.OPEN) {
                            ws.send(JSON.stringify({ location: Math.min(1, box.x / MAP_LENGTH) }))
                        }

                        bgm.pause()
                        bgm.currentTime=0
                        miaoSound.currentTime = 0
                        miaoSound.play()
                        miaoPlayed = true
                    }

                    clearInterval(timeRef.current)
                }

                if (box.y >= platformBaseY - TILE_SIZE - CAT_SIZE+10) {
                    box.y = platformBaseY - TILE_SIZE - CAT_SIZE+10
                    box.vy = 0

                    const currentPlatform = getPlatformUnderBox()
                    if (currentPlatform.color === 'red') {
                        box.vx = -8
                        box.vy = -8
                        box.isBouncingBack = true
                        box.isJumping = true
                        hurtSound.currentTime = 0
                        hurtSound.play()
                    } else {
                        box.vx = 0
                        box.isJumping = false
                        box.isBouncingBack = false
                    }
                }
            }

            if (!success && !isWin && !isLose) {
                const local = box.x / MAP_LENGTH
                const remote = remoteProgress
                if (local >= 1 && remote < 1) {
                    setIsWin(true)
                    bgm.pause()
                    if (ws && ws.readyState == WebSocket.OPEN) {
                        ws.send(JSON.stringify({ location: Math.min(1, box.x / MAP_LENGTH) }))
                    }
                    if (ws) ws.close()
                } else if (remote >= 0.99 && local < 1) {
                    setIsLose(true)
                    bgm.pause()
                    if (ws && ws.readyState == WebSocket.OPEN) {
                        ws.send(JSON.stringify({ location: Math.min(1, box.x / MAP_LENGTH) }))
                    }
                    if (ws) ws.close()
                }
            }

            seaLayers.forEach((img, i) => {
                const speed = 0.1 + i * 0.1 // 每层移动速度不同
                const scrollX = -box.x * speed % canvasWidth

                ctx.drawImage(img, scrollX, 0, canvasWidth, canvasHeight)
                ctx.drawImage(img, scrollX + canvasWidth, 0, canvasWidth, canvasHeight)
            })
            ctx.drawImage(backgroundImg, 0, 0, canvasWidth, canvasHeight)
            drawPlatforms()
            drawCat()


            animationFrameId = requestAnimationFrame(update)
        }

        const keyDownHandler = (e: KeyboardEvent) => {
            if (
                e.code === 'Space' &&
                !box.isJumping &&
                !box.isCharging &&
                !box.isBouncingBack
            ) {
                box.isCharging = true
                box.chargeStart = Date.now()
            }
        }

        const keyUpHandler = (e: KeyboardEvent) => {
            if (e.code === 'Space' && box.isCharging && !box.isBouncingBack) {
                box.isCharging = false
                let chargeTime = Date.now() - box.chargeStart

                chargeTime = Math.min(chargeTime, box.maxCharge)
                chargeTime = Math.max(chargeTime, box.minCharge)

                const powerRatio = chargeTime / 400
                console.log('powerRatio', powerRatio);
                box.vy = -15 * powerRatio
                box.vx = 10 * powerRatio
                box.isJumping = true
            }
        }

        document.addEventListener('keydown', keyDownHandler)
        document.addEventListener('keyup', keyUpHandler)
        update()
        return () => {
            cancelAnimationFrame(animationFrameId)
            document.removeEventListener('keydown', keyDownHandler)
            document.removeEventListener('keyup', keyUpHandler)
            clearInterval(timeRef.current)
            if (ws) {
              ws.close()
            }
            bgm.pause()
        }
    }, [roomId, uuid])
    return (

        <div style={{ width: '100vw', height: '100vh', background: '#dfdb91' }}>
            {success && <SingleSucess time={time} />}
            {isLose && <DoubleLose />}
                <ProgressBar localProgress={Math.min(1, boxX / MAP_LENGTH)} remoteProgress={remoteProgress} />
            <div style={{
                position: 'absolute',
                top: '80px',
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#333',
                backgroundColor: 'rgba(255,255,255,0.8)',
                padding: '6px 12px',
                borderRadius: '6px'
            }}>
                用时：{(time / 1000).toFixed(1)} 秒
            </div>
                <canvas
                    ref={canvasRef}

                    width={canvasWidth}
                    height={canvasHeight}
                    style={{
                        display: 'block',
                        margin: '0 auto',
                        border: 'none',
                    }}
                />
            
        </div>
    )
}