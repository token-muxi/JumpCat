import { useNavigate} from "react-router-dom"
interface SuccessProps{
    time:number
}
export default function SingleSucess({time}:SuccessProps){
    const navigate=useNavigate()
    return(
        <div>
            <div>成功</div>
            <div>用时：{time/1000}</div>  
            <button onClick={()=>{navigate("/")}}>再玩一次</button>
        </div>
    )
}