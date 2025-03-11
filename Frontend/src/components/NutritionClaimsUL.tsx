import React from "react";

interface NutritionClaims {
  claims: string; // Comma-separated string
}

const NutritionClaimsUL: React.FC<NutritionClaims> = ({ claims }) => {
  // Convert comma-separated string into an array & trim spaces
  const claimsListItems = claims.split(",").map((claim) => claim.trim());

  return (
    <ul className="list-group mb-4">
      {claimsListItems.map((claim, index) => (
        <li key={index} className="list-group-item">
          {claim}
        </li>
      ))}
    </ul>
  );
};

export default NutritionClaimsUL;
