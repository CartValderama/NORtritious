import React, { useState } from "react";
import { Button, ButtonGroup, Modal } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";

interface ProductActionsProps {
  productId: number;
  onDelete: (id: number) => Promise<boolean>;
  sm?: boolean;
}

const ProductActions: React.FC<ProductActionsProps> = ({
  productId,
  onDelete,
  sm = false,
}) => {
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation(); // Get current page location

  const handleDeleteClick = () => setShowModal(true);
  const handleClose = () => setShowModal(false);

  const handleConfirmDelete = async () => {
    const success = await onDelete(productId);
    if (success) {
      if (location.pathname.startsWith("/products/details/")) {
        navigate("/products"); // Redirect to products list if on details page
      } else {
        navigate(0); // Reload the current page
      }
    }
    setShowModal(false);
  };

  return (
    <>
      <ButtonGroup className="mb-2">
        <Button
          href={`/products/calculatorUpdate/${productId}`}
          variant="outline-primary"
          aria-label="Rediger produkt"
          size={sm ? "sm" : undefined}
        >
          <i className="bi bi-pencil-square" aria-hidden="true"></i>
        </Button>
        <Button
          onClick={handleDeleteClick}
          variant="outline-danger"
          aria-label="Slett produkt"
          size={sm ? "sm" : undefined}
        >
          <i className="bi bi-trash" aria-hidden="true"></i>
        </Button>
      </ButtonGroup>

      <Modal show={showModal} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Bekreft sletting</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Er du sikker på at du vil slette dette produktet? Denne handlingen kan
          ikke angres.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Avbryt
          </Button>
          <Button variant="danger" onClick={handleConfirmDelete}>
            Slett
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ProductActions;
