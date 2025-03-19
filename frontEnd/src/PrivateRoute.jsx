import * as jwt_decode from 'jwt-decode'; 
import { Navigate } from 'react-router-dom';

const checkTokenValidity = () => {
  const token = localStorage.getItem("token");

  if (token) {
    try {
      const decodedToken = jwt_decode.jwtDecode(token); 
      console.log(jwt_decode.jwtDecode(token))
      const currentTime = Date.now() / 1000; 

      if (decodedToken.exp < currentTime) {
        localStorage.removeItem("token");
        return false; 
      }
      return true;  
    } catch (error) {
      console.error("Errore nel decodificare il token:", error);
      return false;
    }
  }
  return false; 
};

const PrivateRoute = ({ element }) => {
  const isAuthenticated = checkTokenValidity();
console.log(isAuthenticated)
  return isAuthenticated ? element : <Navigate to="/login" replace />;
};

export default PrivateRoute;
