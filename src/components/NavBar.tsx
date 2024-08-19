import { Container, Nav, Navbar } from "react-bootstrap";
import AuthButton from "./AuthButton";
const NavBarC: React.FC = () => {
  return (
    <Navbar
      expand="lg"
      className="bg-body-tertiary"
      bg="dark"
      // data-bs-theme="dark"
      // style={{ backgroundColor: "#29648a" }}
    >
      <Container fluid>
        <Navbar.Brand href="#">memojiro</Navbar.Brand>
        <Navbar.Toggle aria-controls="navbarScroll" />
        <Navbar.Collapse id="navbarScroll" className="justify-content-end">
          <Nav>
            <AuthButton />
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};
export default NavBarC;
