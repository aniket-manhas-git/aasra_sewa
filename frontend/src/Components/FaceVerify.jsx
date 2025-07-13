import React, { useRef, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Webcam from 'react-webcam';
import axios from 'axios';

const FaceVerify = () => {
  const webcamRef = useRef(null);
  const [storedImage, setStoredImage] = useState(null);
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegistration, setIsRegistration] = useState(false);
  const [userData, setUserData] = useState(null);
  const [aadhaarImage, setAadhaarImage] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const videoConstraints = {
    width: 350,
    height: 350,
    facingMode: 'user',
  };

  // Check if this is registration flow
  useEffect(() => {
    if (location.state?.userData) {
      setIsRegistration(true);
      setUserData(location.state.userData);
      setAadhaarImage(location.state.aadhaarImage);
    }
  }, [location.state]);

  // Base64 to Blob converter
  const base64toBlob = (dataURL) => {
    const byteString = atob(dataURL.split(',')[1]);
    const mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  };

  // Capture reference image
  const captureStoredFace = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      setStoredImage(imageSrc);
      setResult('');
    }
  };

  // Upload face image to Cloudinary and register user
  const uploadFaceAndRegister = async () => {
    if (!storedImage) {
      alert('Please capture your face image first.');
      return;
    }

    try {
      setLoading(true);

      // Upload face image to Cloudinary
      const faceBlob = base64toBlob(storedImage);
      const formData = new FormData();
      formData.append('face', faceBlob, 'face.png');

      const API_URL = import.meta.env.VITE_API_URL;
      const faceResponse = await axios.post(`${API_URL}/api/face/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!faceResponse.data.success) {
        throw new Error(faceResponse.data.error || 'Failed to upload face image');
      }

      const faceUrl = faceResponse.data.faceUrl;

      // Upload Aadhaar image to Cloudinary
      const aadhaarFormData = new FormData();
      aadhaarFormData.append('file', aadhaarImage);
      aadhaarFormData.append('upload_preset', 'aasrasewa');

      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
      const aadhaarResponse = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        aadhaarFormData
      );

      const aadhaarUrl = aadhaarResponse.data.secure_url;

      // Register user with all data including face and aadhaar URLs
      const registrationData = {
        ...userData,
        aadhaarImage: aadhaarUrl,
        face: faceUrl,
      };

      const registerResponse = await axios.post(`${API_URL}/api/v1/user/register`, registrationData);

      if (registerResponse.data.success) {
        alert('Registration successful! Please login.');
        navigate('/login');
      } else {
        throw new Error(registerResponse.data.message || 'Registration failed');
      }
    } catch (error) {
      console.error("❌ Registration Error:", error);
      setResult(`⚠️ Registration failed: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Verify captured face (existing functionality)
  const verifyFace = async () => {
    if (!storedImage) {
      alert('Please capture the reference face first.');
      return;
    }

    const verifyImage = webcamRef.current.getScreenshot();
    if (!verifyImage) {
      alert('Failed to capture verification image.');
      return;
    }

    const blob1 = base64toBlob(storedImage);
    const blob2 = base64toBlob(verifyImage);

    const formData = new FormData();
    formData.append('image1', blob1, 'image1.png');
    formData.append('image2', blob2, 'image2.png');

    try {
      setLoading(true);

      const API_URL = import.meta.env.VITE_API_URL;
      console.log("API URL:", API_URL);

      const response = await axios.post(`${API_URL}/api/face/verify`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const { match, distance } = response.data;
      setResult(
        match
          ? `✅ Face Match! (Distance: ${distance})`
          : `❌ Not a Match (Distance: ${distance})`
      );
    } catch (error) {
      console.error("❌ Axios Error:", error);
      setResult('⚠️ Error verifying face. Check backend or network.');
    } finally {
      setLoading(false);
    }
  };

  // Optional: ping backend on load
  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL;
    console.log("Checking backend at:", API_URL);
    axios.get(`${API_URL}/api/face/ping`)
      .then(res => console.log("✅ Backend reachable:", res.data))
      .catch(err => console.error("❌ Backend not reachable:", err.message));
  }, []);

  return (
    <div style={{ textAlign: 'center' }}>
      <h2>{isRegistration ? 'Face Registration' : 'Face Verification'}</h2>
      {isRegistration && (
        <p style={{ color: '#666', marginBottom: '20px' }}>
          Please capture a clear photo of your face for registration
        </p>
      )}
      <Webcam
        audio={false}
        height={350}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        width={350}
        videoConstraints={videoConstraints}
        mirrored
      />
      <div style={{ marginTop: '10px' }}>
        <button onClick={captureStoredFace} disabled={loading}>
          📸 {isRegistration ? 'Capture Face' : 'Capture Reference'}
        </button>
        {isRegistration ? (
          <button onClick={uploadFaceAndRegister} disabled={loading} style={{ marginLeft: '10px' }}>
            🚀 Complete Registration
          </button>
        ) : (
          <button onClick={verifyFace} disabled={loading} style={{ marginLeft: '10px' }}>
            🔍 Verify Face
          </button>
        )}
      </div>
      {loading && <p>{isRegistration ? 'Registering...' : 'Verifying...'}</p>}
      {result && (
        <p style={{ marginTop: '10px' }}>
          <strong>{result}</strong>
        </p>
      )}
      {storedImage && (
        <div style={{ marginTop: '20px' }}>
          <p>{isRegistration ? 'Your Face:' : 'Reference Face:'}</p>
          <img src={storedImage} alt="Stored" width={150} />
        </div>
      )}
    </div>
  );
};

export default FaceVerify;
