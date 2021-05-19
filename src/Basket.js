import React, { useState,useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import firebase from "firebase";
import Confirm from "./confirm";
import Reciept from "./Reciept";
import html2canvas from "html2canvas";


const Basket　= (props) => {
  const basket = useSelector((state) => state.BasketReducer.basket);
  const dispatch = useDispatch();
  const [lastID,setLastID] = useState(0);
  const [OC,setOC] = useState(false);
  const [orderDone,setOrderDone] = useState(false);
  const [yourID,setYourID] = useState();
  const [sum,setSum] =useState(0);
  const [status,setStatus] = useState();
  const [queue,setQueue] = useState(0);
  const [para,setPara] = useState();
  const [eatIn,setEatIn] = useState();
  const shopID = props.shopID;


  
  let total=0;
  let list = [];

  let num=0;

  function getSum(){
    basket.map((item)=>(
      total=total+item.price
    ))
    return total;
  }

  function reset(){
    dispatch({
        type:'RESET',

    });          
    
  }

  function remove(i){
    dispatch({
      type:'REMOVE',
      payload:{num:i}
    });
  }

  
  function addData(list){

    
    let id = lastID;
  
    let ref = firebase.firestore()
    .collection("owners").doc(shopID)
    .collection("orders");
    setYourID(id);

    let price = getSum()*0.5;
    setSum(price);

    if (list.length==0){
      return;
    }else{
      if (eatIn == true){
        if (para==null){
          return;
        }
        ref.add({
        orderID: id,
        list:list,
        served:false,
        bill:price,
        table:para,
        settled: false
        })
      }else{
        let name = document.getElementById("take_out_name").value;
        let phone = document.getElementById("take_out_phone").value;
     
        if (name.length==0 || phone.length==0){
          alert("氏名、携帯番号を入力してください。");
          return;
        }
        let info = name+"様、"+"TEL:"+phone;
        ref.add({
          orderID: id,
          list:list,
          served:false,
          bill:price,
          contact:info
        })
      }
      
      
    }
    
    
    reset();
    toggleOC();
    setOrderDone(!orderDone);
    
    
  }
  
  

  function toggleOC(){
      setOC(!OC);
  }

  function ScrollUnlock() {
    let elems = document.getElementsByTagName("body");
    for (var item of elems) {
      item.classList.remove("scroll-lock");
    }

  }

  function toggleOrderDone(){
    setOrderDone(false);
    ScrollUnlock();
    props.closePopup();
  }

  

  function saveAsImage(url){
      const downloadLink = document.createElement("a");
    
      if (typeof downloadLink.download === "string") {
        downloadLink.href = url;
    
        // ファイル名
        downloadLink.download = "component.png";
    
        // Firefox では body の中にダウンロードリンクがないといけないので一時的に追加
        document.body.appendChild(downloadLink);
    
        // ダウンロードリンクが設定された a タグをクリック
        downloadLink.click();
    
        // Firefox 対策で追加したリンクを削除しておく
        document.body.removeChild(downloadLink);
      } else {
        window.open(url);
      }
  }

  function screenShot(){
    const target = document.getElementById("conf");
    html2canvas(target).then(canvas => {
      const targetImgUri = canvas.toDataURL("img/png");
      saveAsImage(targetImgUri);
    });
  }

  useEffect(()=>{
    let url = window.location.search;

    if (url){
      url = url.substring(1);
      num = Number(url);
      setPara(num);
    }
    
  },[])
    

  

  useEffect(() => {
    async function getQueue(){
    
        await firebase
        .firestore()
        .collection("owners").doc(shopID).collection("orders")
        .where("served","==",false)
        .orderBy("orderID", "asc")
        .onSnapshot((snapshot) => {
            let num = 0; 
            snapshot.forEach((doc) => {
              num += 1;
            })
            setQueue(num);
        })
        
    }
    getQueue();

},[])
  
  useEffect(()=>{
    async function getNewID(){
      await firebase.firestore()
      .collection("owners").doc(shopID)
      .collection("orders")
      .onSnapshot((snapshot)=>{
          let last=0;
      
          snapshot.forEach((doc)=>{

              let id = doc.data().orderID*1;
              if (id > last){
                  last = id;
              }
          })
          setLastID(last*1+1);
      })
  }
    getNewID();

  },[])

  useEffect(()=>{
    async function getStatus(){
    
      await firebase.firestore()
      .collection("owners").doc(shopID)
      .collection("Info").doc("status")
      .onSnapshot((snapshot)=>{
        setStatus(snapshot.data().status);
      })
      
    }
    getStatus();  
  },[])

  useEffect(()=>{
    async function getEatIn(){
        let ref = firebase.firestore()
        .collection("owners").doc(shopID)
        .collection("Info").doc("Eat_in");

        await ref.get().then((doc)=>{
            if (doc.exists){
                setEatIn(doc.data().Eat_in);
             
            }else{
                setEatIn(false);
            }
        })
    }
    getEatIn();
   },[])
  
  
  return (
    <div className='basket' >
      {status ?
      
      
          <div className='basket_inner' >
            <div id="back_button">
                <button　onClick={()=>{toggleOrderDone();}} id="conf_button3">×</button>
            </div>
              {OC ?
                <div>
                 <Confirm message="オーダーを送信しますか？" warning="イタズラ目的、またはご来店していない状態での注文はご遠慮ください。" design="basket_conf" action="注文" order={()=>{addData(list);}} closePopup={()=>{toggleOC();}}/>
                </div>
                :null
                }
          
     
            
            <a id="wait_list">現在、提供待ちのオーダー数：{queue}</a>
            <div className="item_list" >
              {para==null ?
              <div className="take_out_inputs">
              <input type='string' placeholder="氏名(カタカナ）"　id="take_out_name"/>
              <input type='string' placeholder="携帯番号"　id="take_out_phone"/>
              </div>
              :<a id="table_num">テーブル番号：{para}</a>}
           
      
              {orderDone ?
              <div >
                {eatIn ?
                <Confirm message="注文が完了しました。"　 design="basket_conf"　closePopup={()=>{toggleOrderDone()}}　/>
                :
                <Reciept action="この注文完了票を画像として保存"　order={()=>{screenShot();}} orderInfo={[yourID,sum]}  closePopup={()=>{toggleOrderDone()}}/>

                }
              </div>
              : null
              }

              

              <table id="itemListInBasket">
          
                {basket.map((item)=>(
                  num = num+1,
                  item.num = num,
                  list.push(item.name),
                  <tbody key={"tbody"+item.name+num} >
                    <tr key={item.name+num} id="itemInBasket">
                    <td key={"button"+item.num} id="keyInBasket"><a onClick={()=>remove(item.num)} id="delete_key">消去</a></td>
                    <td key={"item"+item.num} id="nameInBasket">{item.name}</td><td key={"price"+item.num} id="priceInBasket">¥{item.price}</td>　
                    </tr>
                  </tbody>
                  
                ))}
              </table>
              
            </div>
            <div className="buttons">
              <a onClick={reset} id="reset">かごを空にする</a>
              <div　className='sum'>
                 合計金額 ¥{getSum()}
              
              </div>

              <button　onClick={()=>toggleOC()} id="button2">注文する</button>
              
              
            </div>

          
          </div>
          :
          <Confirm message="SmartOrder利用停止中" design="basket_conf" closePopup={()=>{toggleOrderDone()}}/>
          }

          
          
            
          
        </div>
  );

}



export default Basket;

