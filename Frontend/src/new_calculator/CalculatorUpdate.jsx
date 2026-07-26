import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import '../css/Calculator.css';
import API_URL from '../apiConfig';
import * as ProductService from '../products/ProductService';
import ProductButtons from '../ProductButtons';
import CustomSelect from '../CustomSelect';
import NutritionForm from './NutritionForm';
import { GROUP_OPTIONS } from './data/categoryOptions';
import { useCalculatorState } from './useCalculatorState.jsx';

const CalculatorUpdate = () => {
  const { productId } = useParams();
  const [loading, setLoading] = useState(true);

  const {
    selectsGroup, setSelectGroups,
    selectsProduct, setSelectProduct,
    selectsFragment, setSelectFragment,
    selectsRation, setSelectRation,
    categoryKey, productOptions, fragmentOptions, rationOptions,
    selectedImage, setSelectedImage,
    product, setProduct,
    nutrition,
    isCalculationCompleted,
    handleChange,
    handleNutritionChange,
    handleCalculationComplete,
    handleHasNokkelhullet,
    handleEfsaNutrition,
    handleHighFibreClaims,
    handleLowSugarClaims,
    handleSugarsFreeClaims,
    handleLowSaltClaims,
    handleLowSatFatClaims,
    healthClaimsProps,
    buildSubmitPayload,
  } = useCalculatorState();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await ProductService.fetchProductById(productId);
        setProduct(response);
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    let imageUrl = '';
    if (selectedImage) {
      const formData = new FormData();
      formData.append('file', selectedImage);
      try {
        const response = await axios.post(
          `${API_URL}/api/products/upload-product-image`,
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' }, withCredentials: true }
        );
        imageUrl = response.data.imageUrl;
      } catch (error) {
        console.error('Image upload failed:', error.response?.data || error.message);
        alert('Feil ved opplasting av bilde.');
        return;
      }
    }

    const payload = buildSubmitPayload();
    const updatedProduct = {
      ...product,
      ...payload,
      group: `<strong>Matgruppe:</strong> ${selectsGroup}`,
      imageUrl,
    };

    try {
      await ProductService.updateProduct(productId, updatedProduct);
      alert('Resept er nå lagret for dette produktet!\nDu kan behandle produktet på produkt-siden.');
    } catch (error) {
      console.error('Error saving product:', error.response ? error.response.data : error.message);
      alert('Noe gikk galt.\nReseptet er ikke lagret.\nSjekk at du er logget inn som matprodusent.');
      if (imageUrl) {
        try {
          await axios.delete(`${API_URL}/api/products/delete-product-image`, {
            data: { imageUrl }, withCredentials: true,
          });
        } catch (deleteError) {
          console.error('Failed to delete orphaned image:', deleteError.response?.data || deleteError.message);
        }
      }
    }
  };

  if (loading) return <div className="p-4">Laster produkt…</div>;

  return (
    <form onSubmit={handleSubmit}>
      <div className="calculator">
        <div className="vstack gap-3 container">
          <div className="row">

            {/* ── Right column: intro + submit ────────────────────────── */}
            <div className="col-md-6 mb-4" style={{ marginTop: '10px' }}>
              <h1>Mulige ernærings- og helsepåstander</h1>
              <p>
                Trykk på "beregn"-knappen for å se resultatet. Først må du sette
                ernæringsverdiene inne i ernæringskolonnen. Resultatet vises på
                høyre side. Hvis en "feil" oppstår, hold musepekeren over feilikonet
                i venstre kolonne for å se detaljene om den spesifikke feilen.
                En kan legge til næringsstoffer som befinner seg i produktet, nederst i venstre kolonne.
                Basert på valgte stoffer, vil EFSA Helsepåstander som tilhører bli generert.
                Hvis visse EFSA Næringskrav treffes, vil det tilføyes ekstra påstander som bare er tilgjengelige dersom kravet til påstanden er oppfylt.
              </p>
              <ProductButtons showSubmitButton={isCalculationCompleted} onSubmit={handleSubmit} />
            </div>

            {/* ── Left column: inputs ──────────────────────────────────── */}
            <div className="col-md-6 order-md-first">
              <h2>Legg inn næringsinnhold</h2>

              <label htmlFor="name" className="form-label">Matvarenavn:</label>
              <div className="input-group mb-3">
                <input
                  id="name" type="text" className="form-control"
                  name="name" value={product.name} onChange={handleChange}
                  placeholder="Matvarenavn"
                />
              </div>

              {selectedImage && (
                <div className="mb-3">
                  <p>Valgt bilde:</p>
                  <img src={URL.createObjectURL(selectedImage)} alt="Preview" className="img-thumbnail" width="150" />
                </div>
              )}

              <label htmlFor="image" className="form-label">Last opp profilbilde:</label>
              <div className="input-group mb-3">
                <input
                  type="file" className="form-control" id="image" name="image" accept="image/*"
                  onChange={(e) => setSelectedImage(e.target.files?.[0] || null)}
                />
              </div>

              <label className="form-label">Matvaregruppe:</label>
              <CustomSelect
                placeholder={<div>Velg matvaregruppe</div>}
                className="form-select-md mb-3"
                onChange={e => { setSelectGroups(e.value); setSelectProduct(''); setSelectFragment(''); setSelectRation(''); }}
                options={GROUP_OPTIONS}
              />

              {productOptions.length > 0 && (
                <div>
                  <label className="form-label">Matkategori:</label>
                  <CustomSelect
                    placeholder={<div>Velg mat</div>}
                    className="form-select-md mb-3"
                    onChange={e => { setSelectProduct(e.value); setSelectFragment(''); setSelectRation(''); setProduct(p => ({ ...p, type: `<strong>Matkategori:</strong> ${e.label}` })); }}
                    options={productOptions}
                  />
                </div>
              )}

              {fragmentOptions.length > 0 && (
                <div>
                  <label className="form-label"><strong>Undermatkategori</strong></label>
                  <CustomSelect
                    placeholder={<div>Velg undermatkategori</div>}
                    className="form-select-md mb-3"
                    onChange={e => { setSelectFragment(e.value); setSelectRation(''); }}
                    options={fragmentOptions}
                  />
                </div>
              )}

              {rationOptions.length > 0 && (
                <div>
                  <label className="form-label"><strong>Undermatkategori</strong></label>
                  <CustomSelect
                    placeholder={<div>Velg undermatkategori</div>}
                    className="form-select-md mb-3"
                    onChange={e => { setSelectRation(e.value); setProduct(p => ({ ...p, type: e.label })); }}
                    options={rationOptions}
                  />
                </div>
              )}
            </div>

          </div>

          <NutritionForm
            category={categoryKey}
            onNutritionChange={handleNutritionChange}
            onCalculationComplete={handleCalculationComplete}
            onNokkelhulletChange={handleHasNokkelhullet}
            onEfsaNutritionChange={handleEfsaNutrition}
            onHighFibreChange={handleHighFibreClaims}
            onLowSugarChange={handleLowSugarClaims}
            onSugarsFreeChange={handleSugarsFreeClaims}
            onLowSaltChange={handleLowSaltClaims}
            onLowSatFatChange={handleLowSatFatClaims}
            healthClaimsProps={healthClaimsProps}
          />

        </div>
      </div>
    </form>
  );
};

export default CalculatorUpdate;
