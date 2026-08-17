import React, { useState, useEffect, useRef } from "react";
import * as ProductService from "../../../services/productService";
import PanelBox from "../../PanelBox";
import Button from "../../Button";
import WarningAlert from "../../WarningAlert";
import CircularProgress from "../../CircularProgress";
import OverviewCard from "../../OverviewCard";
import ResultAccordionSection from "./ResultAccordionSection";
import NokkelhulletSection from "./NokkelhulletSection";
import EfsaSection from "./EfsaSection";
import HealthClaimsSection from "./HealthClaimsSection";
import keyholeLogo from "../../../assets/img/new_resized_image_1.png";
import efsaLogoGreen from "../../../assets/img/efsaLogoGreen.png";
import efsaLogo from "../../../assets/img/efsaLogo.png";
import {
  buildResultStats,
  buildNokkelhulletVerdict,
  buildEfsaVerdict,
  buildHealthClaimsVerdict,
  getEnergyMismatchWarning,
  getEnergyFormulaWarning,
  claimColors,
  claimBadgeText,
  healthClaimsColors,
  getNokkelhulletPercentage,
  getEfsaPercentage,
  buildProductSubmitPayload,
} from "../../../utils/calculator/nutritionResultHelpers";
import { getCategoryKey } from "../../../utils/calculator/categoryOptions";
import { useCalculatorFormStore } from "../../../stores/calculatorFormStore";

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

  if (!category || !foodType) return null;

  if (!result) {
    return (
      <div id="nutrition-result" style={{ flex: "1 1 350px", minWidth: 0 }} />
    );
  }

  const energyMismatchWarning = getEnergyMismatchWarning(nutrition, foodType);
  const energyFormulaWarning = getEnergyFormulaWarning(nutrition, foodType);
  const stats = buildResultStats(result, foodType, category, nutrition);

  const nokkelhulletPercentage = getNokkelhulletPercentage(stats);

  const nokkelhulletColors = claimColors(
    stats.nokkelhulletPassedCount,
    stats.nokkelhulletTotalCount,
  );
  const efsaColors = claimColors(stats.efsaMetCount, stats.efsaTotalCount);
  const healthClaimsColorSet = healthClaimsColors(stats.healthClaimsMetCount);

  const handleSaveProduct = async () => {
    const payload = buildProductSubmitPayload(
      result,
      hasNokkelhullet,
      hasEfsaNutrition,
      nutrition,
    );
    const updatedProduct = {
      ...product,
      ...payload,
      group: `<strong>Matgruppe:</strong> ${selectsGroup}`,
    };

    try {
      await ProductService.saveProductWithImage(updatedProduct, selectedImage);
      alert(
        "Resept er nå lagret for dette produktet!\nDu kan behandle produktet på produkt-siden.",
      );
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
            <Button variant="ghost" size="sm" onClick={handleSaveProduct}>
              <i className="bi bi-save" />
              Lagre produkt
            </Button>
          </div>
        </div>

        <div className="d-flex flex-wrap gap-3 mb-4">
          <OverviewCard>
            <OverviewCard.Header logoSrc={keyholeLogo} title="Nøkkelhullet" />
            <OverviewCard.Metric>
              <CircularProgress
                percentage={nokkelhulletPercentage}
                strokeWidth={16}
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
          messages={[energyMismatchWarning, energyFormulaWarning]}
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
            badgeText={claimBadgeText(
              stats.nokkelhulletPassedCount,
              stats.nokkelhulletTotalCount,
            )}
          >
            <NokkelhulletSection category={category} nutrition={nutrition} />
          </ResultAccordionSection>

          <ResultAccordionSection
            id="efsaResultAccordion"
            logoSrc={efsaLogoGreen}
            title="EFSA Ernæringspåstander"
            open={efsaOpen}
            onToggle={() => setEfsaOpen((o) => !o)}
            colors={efsaColors}
            badgeText={claimBadgeText(stats.efsaMetCount, stats.efsaTotalCount)}
          >
            <EfsaSection
              result={result}
              nutrition={nutrition}
              foodType={foodType}
            />
          </ResultAccordionSection>

          {efsaEnabled && (
            <ResultAccordionSection
              id="healthClaimsResultAccordion"
              logoSrc={efsaLogo}
              title="EFSA Helsepåstander"
              open={healthClaimsOpen}
              onToggle={() => setHealthClaimsOpen((o) => !o)}
              colors={healthClaimsColorSet}
              badgeText={`${stats.healthClaimsMetCount} funnet`}
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
