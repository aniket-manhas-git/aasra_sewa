import React from 'react';
import { useNavigate } from 'react-router-dom';
import FaceVerify from '../components/FaceVerify';
import '../Styles/FaceVerificationPage.css'; // Import the CSS

const FaceVerificationPage = () => {
  const navigate = useNavigate();

  const handleSignupClick = () => {
    navigate('/login'); // Change route if needed
  };

  return (
    <div className="face-verification-container">
      <h1 className="face-verification-heading">Face Verification Portal</h1>
      <FaceVerify />
      <button className="signup-button" onClick={handleSignupClick}>
        Signup
      </button>
    </div>
  );
};

export default FaceVerificationPage;
