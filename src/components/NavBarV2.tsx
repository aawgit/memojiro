import React from "react";
import AuthButton from "./AuthButton";

interface NavBarCProps {
  onAISuggestionsClick?: () => void;
}

const NavBarV2: React.FC<NavBarCProps> = () => {
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
