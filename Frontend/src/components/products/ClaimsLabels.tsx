import React from "react";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Popover from "react-bootstrap/Popover";
import API_URL from "../../apiConfig";

interface ClaimsLabelsProps {
  hasNokkelhullet: boolean;
  hasEfsaNutrition: string; // String containing claims
}

const ClaimsLabels: React.FC<ClaimsLabelsProps> = ({
  hasNokkelhullet,
  hasEfsaNutrition,
}) => {
  return (
    <div className="p-2 d-flex align-items-center">
      {hasNokkelhullet && (
        <OverlayTrigger
          trigger="hover"
          placement="top"
          overlay={
            <Popover id="popover-nokkelhullet">
              <Popover.Body>Støtter Nøkkelhullet</Popover.Body>
            </Popover>
          }
        >
          <img
            src={`${API_URL}/images/circle-keyhole-logo.png`}
            height="30px"
            className="pe-2"
            alt="Støtter Nøkkelhullet"
            aria-label="Støtter Nøkkelhullet"
            title="Støtter Nøkkelhullet"
            style={{ cursor: "pointer" }}
          />
        </OverlayTrigger>
      )}

      {hasEfsaNutrition !== "" && (
        <OverlayTrigger
          trigger="hover"
          placement="top"
          overlay={
            <Popover id="popover-nutrition">
              <Popover.Body>{hasEfsaNutrition}</Popover.Body>
            </Popover>
          }
        >
          <img
            src={`${API_URL}/images/efsaLogoGreen.png`}
            height="30px"
            alt="Har EFSA næringspåstander"
            aria-label="Har EFSA næringspåstander"
            title="Har EFSA næringspåstander"
            style={{ cursor: "pointer" }}
          />
        </OverlayTrigger>
      )}
    </div>
  );
};

export default ClaimsLabels;
