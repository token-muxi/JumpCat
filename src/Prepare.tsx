import React,{useState} from "react";
import { useParams } from "react-router-dom";
import './Prepare.css'
export default function Prepare(){
    const {room_id}=useParams()
    return(
        <div>
            <div className="center">
                
                <div style={{display:'flex',flexDirection:'column'}}>
                    <img src="/assets/cat01.png" style={{height:'200px',marginRight:'200px',marginBottom:"30px"}}></img>
                    <button className="btn" style={{height:'50px',width:'100px'}}>准备</button>
                </div>
                <div style={{position:'absolute',bottom:'200px',fontSize:'30px'}}>匹配成功</div>
                <div className="outer-circle">
                    <div className="inner-circle">
                        
                        <img src="/assets/cloud.png" className="png"></img>
                        
                        <img src="/assets/box1.png" className="png" style={{height:'150px',width:'200px'}}></img>
                    </div>
                </div>
                <div style={{display:'flex',flexDirection:'column'}}>
                    <img src="/assets/cat01.png" style={{height:'200px',marginLeft:'200px',marginBottom:"30px"}}></img>
                    <button className="btn" style={{height:'50px',width:'100px',marginLeft:'200px'}}>准备</button>
                    
                </div>
            </div>
            <div style={{display:'flex',justifyContent:'center',alignItems:'center',marginTop:'100px',fontSize:'30px'}}>房间号：{room_id}</div>
        </div>
    )
}