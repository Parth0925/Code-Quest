import * as api from "../api"
import axios from "axios";
export const fetchallusers=()=> async(dispatch)=>{
    try {
        const {data}=await api.getallusers();
        dispatch({type:"FETCH_USERS",payload:data});
    } catch (error) {
        console.log(error)
    }
}

export const updateprofile=(id,updatedata)=>async(dispatch)=>{
    try {
        const {data}=await api.updateprofile(id,updatedata);
        dispatch({type:"UPDATE_CURRENT_USER",payload:data});
    } catch (error) {
        console.log(error)
    }
}

export const getUserSettings = async () => {
    const response = await axios.get('/api/user/settings');
    return response.data;
  };
  
  export const updateUserSettings = async (settings) => {
    const response = await axios.post('/api/user/settings', settings);
    return response.data;
  };