import React from 'react';
import PropTypes from 'prop-types';
import Basket from './Basket';
import Login from './Login';
import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import firebase from "firebase";
import Confirm from './confirm';
import Setting from './Setting';

const Nav　= (props) =>{
    const [popup,setPopup] =useState(false);
    const [login,setLogin] = useState(false);
    const [user,setUser] = useState(false);
    //const [log,setLog] = useState(false);
    const [setting,setSetting] = useState(false);
    const dispatch = useDispatch();
    const shopID = props.shopID;
    const account = useSelector((state) => state.AccountReducer.isSignedIn);
    

    const propTypes = {
        dataFood: PropTypes.func,
        dataDrink: PropTypes.func,
        dataEdit: PropTypes.func,
        dataOrders: PropTypes.func,
    };


    function togglePopup() {
        setPopup(!popup);
    }
  
 

    function toggleSetting(){
      setSetting(!setting);
    }
  
    function clickFood(){
          return props.dataFood();
    }
  
    function clickDrink(){
          return props.dataDrink();
    }

    function clickEdit(){
      return props.dataEdit();
    }

    function clickOrders(){
      return props.dataOrders();
    }

    function componentDidMount() {
      firebase.auth().onAuthStateChanged(user => {
        if (!user){
          dispatch({
            type:'LOGIN',
            payload:{isSignedIn:false}
          });
        }else {
          setUser(true);
          dispatch({
            type:'LOGIN',
            payload:{isSignedIn:true}
          });
        }
      });
    }




  
    componentDidMount()

    return (
      

        <div className="nav" >
          
          
          {user ?
          <div id="edit_buttons">
          <p id ="button4"><a onClick={()=>{setSetting(!setting);}}>SETTING</a></p> 
          <p id ="button4"><a onClick={()=>{clickEdit();}}>EDIT</a></p>
          </div>
          :null
          }
         
       
          <div className="list">
            
           
            <p id="button1"><a onClick={()=>{clickFood();}}>{props.navli[0]}</a></p>
            <p id="button1"><a onClick={()=>{clickDrink();}}>{props.navli[1]}</a></p>
            {user ?
            <p id="button1"><a onClick={()=>{clickOrders();}}>ORDERS</a></p>
            : <p id="button1"><a onClick={()=>{togglePopup();}}>BASKET</a></p>
            }
            
            
          </div>

          
          
          <div className='app'>
            {popup ? 
            <Basket closePopup={()=>{togglePopup();}} shopID={props.shopID}/>
            : null
            }

          </div>

          <div className='app'>
            {setting? 
            <Setting shopID={shopID} message="各種設定"　closePopup={()=>{setSetting(!setting);}} clear={()=>{setUser(false)}}/>
            : null
            }
         
          </div>
          
          
        </div>
        

    );

}

export default Nav;
