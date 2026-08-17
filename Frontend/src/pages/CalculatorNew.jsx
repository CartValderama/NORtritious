import React from "react";
import { Link } from "react-router-dom";
import Breadcrumb from "react-bootstrap/Breadcrumb";
import "../css/Calculator.css";
import NutritionForm from "../components/calculator/new/NutritionForm";
import NutritionResult from "../components/calculator/new/NutritionResult";
import ProductInfoSection from "../components/calculator/new/ProductInfoSection";
import CalculatorInstructions from "../components/calculator/new/CalculatorInstructions";

const CalculatorNew = () => {
  return (
    <div
      className="flex-grow-1 d-flex flex-column"
      style={{ backgroundColor: "#fafafa", fontFamily: "Inter, sans-serif" }}
    >
      <div className="d-flex flex-column gap-3 container py-4 flex-grow-1">
        <Breadcrumb className="mb-0 new-calc-breadcrumb">
          <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/" }}>
            Hjem
          </Breadcrumb.Item>
          <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/products" }}>
            Produkter
          </Breadcrumb.Item>
          <Breadcrumb.Item active>Kalkulator</Breadcrumb.Item>
        </Breadcrumb>

        <div>
          <h1 className="fs-2">Mulige ernærings- og helsepåstander</h1>
          <p className="mt-3 mb-1" style={{ lineHeight: 1.7 }}>
            Denne kalkulatoren hjelper deg å sjekke om et matprodukt kan merkes
            med Nøkkelhullet og hvilke EFSA-godkjente ernærings- og
            helsepåstander det kan bruke, basert på næringsinnholdet du legger
            inn.
          </p>
        </div>

        <CalculatorInstructions />

        <ProductInfoSection />

        <div className="d-flex flex-wrap flex-grow-1 gap-4">
          <NutritionForm />
          <NutritionResult />
        </div>
      </div>
    </div>
  );
};

export default CalculatorNew;
