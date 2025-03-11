import React from "react";
import { OverlayTrigger, Popover } from "react-bootstrap";

const NoAccess: React.FC = () => {
  return (
    <OverlayTrigger
      trigger="hover"
      placement="top"
      overlay={
        <Popover id="popover-nokkelhullet">
          <Popover.Body>Din bruker har kun visningrettigheter</Popover.Body>
        </Popover>
      }
    >
      <span
        className="text-danger"
        data-bs-toggle="tooltip"
        title="Du har ikke behandlings-rettigheter"
      >
        <i className="bi bi-x-circle"></i>
      </span>
    </OverlayTrigger>
  );
};

export default NoAccess;
