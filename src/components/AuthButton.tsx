import React from "react";
import { Button } from "react-bootstrap";
import { useAuth } from "../hooks/useAuth";

const AuthButton: React.FC = () => {
  const { user, login, logout } = useAuth();

  return (
    <Button onClick={user ? logout : login}>
      {user ? "Logout" : "Login with Google"}
    </Button>
  );
};

export default AuthButton;
