import axios from 'axios';
import Cookies from 'js-cookie';
import ApiRoutes from './constants';

export const login = async (email, password) => {
  try {
    const response = await axios.post(ApiRoutes.LOGIN, { email, password });
    const { token } = response.data;

    Cookies.set('auth_token', token, {
      path: '/',
      expires: 7,
      sameSite: 'lax',
      secure: true  
    });
      
    return true;
  } catch (error) {
    console.error('Erro no login', error);
    return false;
  }
};

export const logout = () => {
  Cookies.remove('auth_token'); 
};


export const isAuthenticated = () => {
  return !!Cookies.get('auth_token');
};

export const getToken = () => {
  return Cookies.get('auth_token');
};
