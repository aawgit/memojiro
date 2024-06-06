import React from "react";
// import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Col } from "react-bootstrap";
import "../styles/MacOSLayout.css"; // Custom styles

const MacOSLayout: React.FC = () => {
  return (
    <Container fluid className="macos-container">
      <Row className="macos-header">
        <Col>
          <h1 className="macos-title">MacOS Style UI</h1>
        </Col>
      </Row>
      <Row className="macos-content">
        <Col md={3} className="macos-sidebar">
          <h2 className="macos-section-title">Sidebar</h2>
          <p className="macos-text">Some sidebar content</p>
        </Col>
        <Col md={6} className="macos-main">
          <h2 className="macos-section-title">Main Content</h2>
          <p className="macos-text">Some main content</p>
        </Col>
        <Col md={3} className="macos-extra">
          <h2 className="macos-section-title">Extra Content</h2>
          <p className="macos-text">Some extra content</p>
        </Col>
      </Row>
    </Container>
  );
};

export default MacOSLayout;
