import React from "react";

interface RoleRightsTableProps {
  role: string;
}

const RoleRightsTable: React.FC<RoleRightsTableProps> = ({ role }) => {
  const getColumnClass = (role: string, columnRole: string) => {
    return role === columnRole ? "border border-bottom-0" : "";
  };

  return (
    // <-- Return her
    <table className="table text-center">
      <caption>Rollerettigheter</caption>
      <thead>
        <tr>
          <th style={{ width: "40%" }}></th>
          <th
            className={getColumnClass(role, "Researcher")}
            style={{ width: "20%" }}
          >
            Researcher
          </th>
          <th
            className={getColumnClass(role, "Producer")}
            style={{ width: "20%" }}
          >
            Producer
          </th>
          <th
            className={getColumnClass(role, "Admin")}
            style={{ width: "20%" }}
          >
            Administrator
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <th className="text-start">Vise alle produkter</th>
          <td>
            <i className="bi bi-check-circle-fill text-success"></i>
          </td>
          <td></td>
          <td>
            <i className="bi bi-check-circle-fill text-success"></i>
          </td>
        </tr>
        <tr>
          <th className="text-start">Vise egne produkter</th>
          <td></td>
          <td>
            <i className="bi bi-check-circle-fill text-success"></i>
          </td>
          <td></td>
        </tr>
        <tr>
          <th className="text-start">Opprette eget produkt</th>
          <td></td>
          <td>
            <i className="bi bi-check-circle-fill text-success"></i>
          </td>
          <td></td>
        </tr>
        <tr>
          <th className="text-start">Oppdatere eget produkt</th>
          <td></td>
          <td>
            <i className="bi bi-check-circle-fill text-success"></i>
          </td>
          <td></td>
        </tr>
        <tr>
          <th className="text-start">Slette eget produkt</th>
          <td></td>
          <td>
            <i className="bi bi-check-circle-fill text-success"></i>
          </td>
          <td></td>
        </tr>
        <tr>
          <th className="text-start">Oppdatere alle produkter</th>
          <td></td>
          <td></td>
          <td>
            <i className="bi bi-check-circle-fill text-success"></i>
          </td>
        </tr>
        <tr>
          <th className="text-start">Slette alle produkter</th>
          <td></td>
          <td></td>
          <td>
            <i className="bi bi-check-circle-fill text-success"></i>
          </td>
        </tr>
      </tbody>
    </table>
  );
};

export default RoleRightsTable;
