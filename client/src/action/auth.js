import * as api from '../api';
import { setcurrentuser } from './currentuser';
import { fetchallusers } from './users';
import axios from 'axios';

export const signup =(authdata,naviagte)=> async(dispatch)=>{
    try {
        const{data}=await api.signup(authdata);
        dispatch({type:"AUTH",data})
        dispatch(setcurrentuser(JSON.parse(localStorage.getItem("Profile"))));
        dispatch(fetchallusers())
        naviagte("/")
    } catch (error) {
        console.log(error)
    }
}
export const login =(authdata,naviagte)=> async(dispatch)=>{
    try {
        const{data}=await api.login(authdata);
        dispatch({type:"AUTH",data})
        dispatch(setcurrentuser(JSON.parse(localStorage.getItem("Profile"))));
        naviagte("/")
    } catch (error) {
        console.log(error)
    }
}
export const sendResetRequest = (emailOrPhone) => async (dispatch) => {
    try {
      const response = await axios.post('/api/user/forgot-password', { emailOrPhone });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data || error.message);
    }
  };

  