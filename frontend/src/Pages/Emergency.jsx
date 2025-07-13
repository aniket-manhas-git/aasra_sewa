import React, { useEffect, useState } from "react";
import "../Styles/Emergency.css";
import { IconButton, Tooltip } from "@mui/material";
import LocalPoliceIcon from "@mui/icons-material/LocalPolice";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import WavesIcon from "@mui/icons-material/Waves";
import FemaleIcon from "@mui/icons-material/Female";
import ChildCareIcon from "@mui/icons-material/ChildCare";
import TrainIcon from "@mui/icons-material/Train";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";

const EmergencyPage = () => {
  const [location, setLocation] = useState({ lat: null, lng: null });

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        error => {
          console.error("Location access denied or unavailable.", error);
        }
      );
    }
  }, []);

  const handleCall = () => {
    window.location.href = "tel:100";
  };

  const mapSrc =
    location.lat && location.lng
      ? `https://maps.google.com/maps?q=${location.lat},${location.lng}&z=17&output=embed`
      : `https://maps.google.com/maps?q=Model%20Institute%20of%20Engineering&t=&z=17&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className="emergency-container">
      {/* Map Section */}
      <div className="map-section">
        <iframe
          title="map"
          src={mapSrc}
          frameBorder="0"
          allowFullScreen
        ></iframe>
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        <div className="icon-row">
          <Tooltip title="Police">
            <IconButton className="icon-button" onClick={handleCall}>
              <LocalPoliceIcon fontSize="large" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Fire">
            <IconButton className="icon-button" onClick={handleCall}>
              <LocalFireDepartmentIcon fontSize="large" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Medical">
            <IconButton className="icon-button" onClick={handleCall}>
              <LocalHospitalIcon fontSize="large" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Disaster">
            <IconButton className="icon-button" onClick={handleCall}>
              <WavesIcon fontSize="large" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Women Safety">
            <IconButton className="icon-button" onClick={handleCall}>
              <FemaleIcon fontSize="large" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Child Help">
            <IconButton className="icon-button" onClick={handleCall}>
              <ChildCareIcon fontSize="large" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Railway">
            <IconButton className="icon-button" onClick={handleCall}>
              <TrainIcon fontSize="large" />
            </IconButton>
          </Tooltip>
          <Tooltip title="SOS">
            <IconButton className="icon-button" onClick={handleCall}>
              <ReportProblemIcon fontSize="large" />
            </IconButton>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};

export default EmergencyPage;
