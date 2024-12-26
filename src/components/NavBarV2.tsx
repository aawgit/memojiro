import React from "react";
import { Container, Nav, Navbar } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRobot } from "@fortawesome/free-solid-svg-icons";
import AuthButton from "./AuthButton";

interface NavBarCProps {
  onAISuggestionsClick?: () => void;
}

const NavBarV2: React.FC<NavBarCProps> = ({ onAISuggestionsClick }) => {
  return (
    <div className="nav-bar">
      <h3 className="nav-title">memojiro</h3>
      <div className="auth-button-container">
        <AuthButton />
      </div>
    </div>
  );
};


export default NavBarV2;
