import { Container, Nav, Navbar } from "react-bootstrap";
import AuthButton from "./AuthButton";

// Define the props type
interface NavBarCProps {
  onAISuggestionsClick?: () => void;
}

const NavBarC: React.FC<NavBarCProps> = ({ onAISuggestionsClick }) => {
  return (
    <Navbar
      expand="lg"
      className="bg-body-tertiary"
      bg="dark"
      // style={{ backgroundColor: "#eae7dc" }}
    >
      <Container fluid>
        <Navbar.Brand href="#">memojiro</Navbar.Brand>
        <Navbar.Toggle aria-controls="navbarScroll" />
        <Navbar.Collapse id="navbarScroll" className="justify-content-end">
          <Nav >
            {onAISuggestionsClick && (
              <Nav.Link onClick={onAISuggestionsClick}>
                Suggestions by AI
              </Nav.Link>
            )}
            <AuthButton />
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavBarC;
