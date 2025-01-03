import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/slide.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; 

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    password: '',
    isSignUp: false
  });

  const { name, email, phoneNumber, password, isSignUp } = formData;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFormToggle = () => {
    setFormData({ ...formData, isSignUp: !isSignUp });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(formData);
    const apiUrl = isSignUp ? 'http://localhost:8080/api/auth/signup' : 'http://localhost:8080/api/auth/login';
    const requestData = { name, email, phoneNumber, password };
    console.log(requestData);
    setIsSubmitting(true); // Disable button while submitting

    try {
      const response = await axios.post(apiUrl, requestData);

      // Handling success response
      await toast.success(`${isSignUp ? 'Signup' : 'Login'} Successful`);
      
      if (isSignUp) {
        setFormData({ ...formData, isSignUp: false });
      } else {
        const { id, name, token } = response.data; // Assuming server sends {id, name, token}
        console.log('Server Response:', response.data);

        if (id && name && token) {
          // Save user data in localStorage
          localStorage.setItem('userId', id); // Save userId
          localStorage.setItem('name', name); // Save user name
          localStorage.setItem('token', token); // Save JWT token
        } else {
          console.error('Missing data in server response:', response.data);
        }
        
        navigate('/dashboard'); // Redirect to dashboard
      }
    } catch (error) {
      console.error(`${isSignUp ? 'Signup' : 'Login'} failed:`, error);
      toast.error(`${isSignUp ? 'Signup' : 'Login'} failed`);
    } finally {
      setIsSubmitting(false); // Re-enable button after submission
    }
  };

  return (
    <div className="body">
      <div className={`container ${isSignUp ? 'right-panel-active' : ''}`}>
        <div className="form-container sign-up-container">
          <form onSubmit={handleSubmit}>
            <h1>Create Account</h1>
            <input type="text" placeholder="Username" name="name" value={name} onChange={handleChange} required />
            <input type="email" placeholder="Email" name="email" value={email} onChange={handleChange} required />
            <input type="text" placeholder="Phone No" name="phoneNumber" value={phoneNumber} onChange={handleChange} required />
            <input type="password" placeholder="Password" name="password" value={password} onChange={handleChange} required />
            <button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Submitting...' : 'Register'}</button>
          </form>
        </div>
        <div className="form-container sign-in-container">
          <form onSubmit={handleSubmit}>
            <h1>Login</h1>
            <input type="email" placeholder="Email" name="email" value={email} onChange={handleChange} required />
            <input type="password" placeholder="Password" name="password" value={password} onChange={handleChange} required />
            <button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Submitting...' : 'Login'}</button>
          </form>
        </div>
        <div className="overlay-container">
          <div className="overlay">
            <div className="overlay-panel overlay-left">
              <h2>Already have an account?</h2>
              <p>Please login to access your portfolio.</p>
              <button className="ghost" onClick={handleFormToggle}>
                Login
              </button>
            </div>
            <div className="overlay-panel overlay-right">
              <h2>Don't have an account?</h2>
              <p>Go ahead and create an account to manage your stocks!</p>
              <button className="ghost" onClick={handleFormToggle}>
                Register
              </button>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Register;
