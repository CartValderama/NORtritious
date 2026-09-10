import React, { useState, useEffect, useRef } from "react";
import * as ProductService from "../../services/productService";
import PanelBox from "../PanelBox";
import Button from "../Button";
import WarningAlert from "../WarningAlert";
import CircularProgress from "../CircularProgress";
import OverviewCard from "../OverviewCard";
import ResultAccordionSection from "./ResultAccordionSection";
import NokkelhulletSection from "./NokkelhulletSection";
import EfsaSection from "./EfsaSection";
import HealthClaimsSection from "./HealthClaimsSection";
import keyholeLogo from "../../assets/img/new_resized_image_1.png";
import efsaLogoGreen from "../../assets/img/efsaLogoGreen.png";
import efsaLogo from "../../assets/img/efsaLogo.png";
import {
  buildResultStats,
  buildNokkelhulletVerdict,
  buildEfsaVerdict,
  buildHealthClaimsVerdict,
  claimColors,
  claimBadges,
  healthClaimsColors,
  healthClaimsBadges,
  getNokkelhulletPercentage,
  getEfsaPercentage,
  buildProductSubmitPayload,
} from "../../utils/calculator/nutritionResultHelpers";
import { getCategoryKey } from "../../utils/calculator/categoryOptions";
import { fetchCalculatorReport } from "../../services/calculatorService";
import { useCalculatorFormStore } from "../../stores/calculatorFormStore";

const NutritionResult = () => {
  const {
    calculation,
    efsaDisabled,
    foodType,
    selectsGroup,
    selectsProduct,
    selectsFragment,
    selectsRation,
    selectedImage,
    product,
    hasNokkelhullet,
    hasEfsaNutrition,
    resetToken,
    efsaValues,
  } = useCalculatorFormStore((s) => ({
    calculation: s.calculation,
    efsaDisabled: s.efsaDisabled,
    foodType: s.foodType,
    selectsGroup: s.selectsGroup,
    selectsProduct: s.selectsProduct,
    selectsFragment: s.selectsFragment,
    selectsRation: s.selectsRation,
    selectedImage: s.selectedImage,
    product: s.product,
    hasNokkelhullet: s.hasNokkelhullet,
    hasEfsaNutrition: s.hasEfsaNutrition,
    resetToken: s.resetToken,
    efsaValues: s.efsaValues,
  }));
  const category = getCategoryKey(
    selectsProduct,
    selectsFragment,
    selectsRation,
  );
  const result = calculation?.data ?? null;
  const nutrition = calculation?.nutrition ?? null;
  const efsaEnabled = !efsaDisabled;

  const [nokkelhulletOpen, setNokkelhulletOpen] = useState(false);
  const [efsaOpen, setEfsaOpen] = useState(false);
  const [healthClaimsOpen, setHealthClaimsOpen] = useState(false);
  const [showSaveMenu, setShowSaveMenu] = useState(false);

  // resetToken bumps on category change/Nullstill/EFSA toggle-off — without
  // watching it, an accordion left open from a previous product would still
  // show as open (and colored) for a newly picked category, before the user
  // ever clicked it for that category.
  const isFirstRun = useRef(true);
  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    setNokkelhulletOpen(false);
    setEfsaOpen(false);
    setHealthClaimsOpen(false);
  }, [resetToken]);

  useEffect(() => {
    if (!showSaveMenu) return undefined;
    const handleClickOutside = (e) => {
      if (!e.target.closest(".nutrition-save-menu")) {
        setShowSaveMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showSaveMenu]);

  if (!category || !foodType) return null;

  if (!result) {
    return (
      <div id="nutrition-result" style={{ flex: "1 1 350px", minWidth: 0 }} />
    );
  }

  // Plausibility warnings come from the backend, computed against the same conversion
  // factors it uses for the saturated-fat claim.
  const warnings = result.warnings ?? [];
  const stats = buildResultStats(result);

  const nokkelhulletPercentage = getNokkelhulletPercentage(stats);

  const nokkelhulletColors = claimColors(
    stats.nokkelhulletPassedCount,
    stats.nokkelhulletTotalCount,
  );
  const efsaColors = claimColors(stats.efsaMetCount, stats.efsaTotalCount);
  const healthClaimsColorSet = healthClaimsColors(stats.healthClaimsMetCount);

  const handleSavePdf = async () => {
    setShowSaveMenu(false);
    try {
      const blob = await fetchCalculatorReport({
        ...calculation.payload,
        productName: product.name,
        matvaregruppe: selectsGroup,
        efsaEnabled,
      });
      // Object URL rather than a data URL: the report is a few hundred kB and a data URL
      // would put the whole thing in the DOM.
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${product.name || "produkt"}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating report:", error);
      alert("Kunne ikke lage rapporten. Prøv igjen.");
    }
  };

  const isEditing = Boolean(product.productId);

  const handleSaveProduct = async () => {
    setShowSaveMenu(false);
    const payload = buildProductSubmitPayload(
      result,
      hasNokkelhullet,
      hasEfsaNutrition,
      nutrition,
      category,
      foodType,
      efsaValues,
    );
    const updatedProduct = {
      ...product,
      ...payload,
      group: `<strong>Matgruppe:</strong> ${selectsGroup}`,
    };

    try {
      if (isEditing) {
        await ProductService.updateProductWithImage(
          product.productId,
          updatedProduct,
          selectedImage,
        );
        alert("Produktet er nå oppdatert!");
      } else {
        await ProductService.saveProductWithImage(updatedProduct, selectedImage);
        alert(
          "Resept er nå lagret for dette produktet!\nDu kan behandle produktet på produkt-siden.",
        );
      }
    } catch (error) {
      const isUploadFailure = error?.stage === "upload";
      console.error(
        isUploadFailure ? "Image upload failed:" : "Error saving product:",
        error?.cause?.response?.data || error?.cause?.message,
      );
      alert(
        isUploadFailure
          ? "Feil ved opplasting av bilde."
          : "Noe gikk galt.\nReseptet er ikke lagret.\nSjekk at du er logget inn som matprodusent.",
      );
    }
  };

  return (
    <div id="nutrition-result" style={{ flex: "1 1 350px", minWidth: 0 }}>
      <PanelBox className="mb-5">
        <div
          className="d-flex align-items-center justify-content-between gap-2 mb-4 pb-3"
          style={{
            borderBottom: "1px solid #dee2e6",
            marginLeft: "-1.5rem",
            marginRight: "-1.5rem",
            paddingLeft: "1.5rem",
            paddingRight: "1.5rem",
          }}
        >
          <h2 className="mb-0 fs-5 fw-bold">Resultat</h2>
          <div className="d-flex align-items-center gap-2">
            <Button variant="ghost" size="sm">
              <i className="bi bi-share" />
              Del produkt
            </Button>
            <div className="nutrition-save-menu position-relative flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSaveMenu((v) => !v)}
                aria-haspopup="true"
                aria-expanded={showSaveMenu}
              >
                <i className="bi bi-save" />
                {isEditing ? "Oppdater produkt" : "Lagre produkt"}
              </Button>
              {showSaveMenu && (
                <div
                  className="rounded-2 shadow-sm"
                  style={{
                    position: "absolute",
                    top: "100%",
                    right: 0,
                    minWidth: "200px",
                    backgroundColor: "#fff",
                    border: "1px solid #dee2e6",
                    zIndex: 10,
                  }}
                >
                  <Button
                    variant="menuItem"
                    className="px-3 py-2"
                    style={{ textDecoration: "none", whiteSpace: "nowrap" }}
                    onClick={handleSavePdf}
                  >
                    <i className="bi bi-file-earmark-pdf" />
                    Lagre som PDF
                  </Button>
                  <Button
                    variant="menuItem"
                    className="px-3 py-2"
                    style={{ textDecoration: "none", whiteSpace: "nowrap" }}
                    onClick={handleSaveProduct}
                  >
                    <i className="bi bi-person-circle" />
                    {isEditing ? "Oppdater i profil" : "Lagre til profil"}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="d-flex flex-wrap gap-3 mb-4">
          <OverviewCard>
            <OverviewCard.Header logoSrc={keyholeLogo} title="Nøkkelhullet" />
            <OverviewCard.Metric>
              {/* Nøkkelhullet is all or nothing: a product either qualifies for the mark or
                  it doesn't, and there is no partial credit to earn. The gradient the ring
                  uses by default made 75 % look like progress, when it means the product
                  can't carry the mark. So green only at 100 %, red otherwise. The
                  ernæringspåstander ring below keeps the gradient, because there each claim
                  it clears is one it can actually print. */}
              <CircularProgress
                percentage={nokkelhulletPercentage}
                strokeWidth={16}
                color={nokkelhulletPercentage >= 100 ? "#198754" : "#dc3545"}
              />
            </OverviewCard.Metric>
            <OverviewCard.Footer>
              {buildNokkelhulletVerdict(stats)}
            </OverviewCard.Footer>
          </OverviewCard>

          <OverviewCard>
            <OverviewCard.Header
              logoSrc={efsaLogoGreen}
              title="Ernæringspåstander"
            />
            <OverviewCard.Metric>
              <CircularProgress
                percentage={getEfsaPercentage(stats)}
                strokeWidth={16}
              />
            </OverviewCard.Metric>
            <OverviewCard.Footer>{buildEfsaVerdict(stats)}</OverviewCard.Footer>
          </OverviewCard>

          <OverviewCard>
            <OverviewCard.Header logoSrc={efsaLogo} title="Helsepåstander" />
            <OverviewCard.Metric>
              <span
                className="fw-bold"
                style={{ fontSize: "7rem", lineHeight: "1" }}
              >
                {stats.healthClaimsMetCount}
              </span>
            </OverviewCard.Metric>
            <OverviewCard.Footer>
              {buildHealthClaimsVerdict(stats)}
            </OverviewCard.Footer>
          </OverviewCard>
        </div>

        <WarningAlert
          messages={warnings}
          className="mb-4"
        />

        <div className="d-flex flex-column gap-3">
          <ResultAccordionSection
            id="nokkelhulletResultAccordion"
            logoSrc={keyholeLogo}
            title="Nøkkelhullet"
            open={nokkelhulletOpen}
            onToggle={() => setNokkelhulletOpen((o) => !o)}
            colors={nokkelhulletColors}
            badges={claimBadges(
              stats.nokkelhulletPassedCount,
              stats.nokkelhulletTotalCount,
            )}
          >
            <NokkelhulletSection
              requirements={result.nokkelhulletRequirements}
            />
          </ResultAccordionSection>

          <ResultAccordionSection
            id="efsaResultAccordion"
            logoSrc={efsaLogoGreen}
            title="EFSA Ernæringspåstander"
            open={efsaOpen}
            onToggle={() => setEfsaOpen((o) => !o)}
            colors={efsaColors}
            badges={claimBadges(stats.efsaMetCount, stats.efsaTotalCount)}
          >
            <EfsaSection result={result} />
          </ResultAccordionSection>

          {efsaEnabled && (
            <ResultAccordionSection
              id="healthClaimsResultAccordion"
              logoSrc={efsaLogo}
              title="EFSA Helsepåstander"
              open={healthClaimsOpen}
              onToggle={() => setHealthClaimsOpen((o) => !o)}
              colors={healthClaimsColorSet}
              badges={
                healthClaimsOpen
                  ? healthClaimsBadges(
                      stats.healthClaimsMetCount,
                      stats.healthClaimsTotalCount,
                    )
                  : claimBadges(
                      stats.healthClaimsMetCount,
                      stats.healthClaimsTotalCount,
                    )
              }
            >
              <HealthClaimsSection result={result} />
            </ResultAccordionSection>
          )}
        </div>
      </PanelBox>
    </div>
  );
};

export default NutritionResult;
