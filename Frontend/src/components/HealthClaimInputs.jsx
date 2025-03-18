import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Popover, OverlayTrigger } from 'react-bootstrap';
import CustomSelect from '../CustomSelect';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons';
import API_URL from '../apiConfig';


const HealthClaimsInputs = ({
  selectVitamins,
  selectMinerals,
  selectOthers,
  filteredOptions,
  selectedVitamins,
  selectedMinerals,
  selectedOthers,
  selectedMeetsReqs,
  vitaminInputValues,
  mineralInputValues,
  otherInputValues,
  meetsReqsInputValues,
  vitaminUnits,
  mineralUnits,
  handleVitaminChange,
  handleMineralChange,
  handleOtherChange,
  handleVitaminInputChange,
  handleMineralInputChange,
  handleOtherInputChange,
  handleMeetsReqsInputChange,
  handleVitaminUnitChange,
  handleMineralUnitChange,
  setSelectedMeetsReqs,
  openInfoLink,
  popover}) => {

return (
       <div className="col-md" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
       <Container style={{ border: '1px solid #ccc', padding: '10px', borderRadius: '5px', marginTop: '10px', marginBottom: '10px', backgroundColor: '#f9f9f9', maxHeight: '1000px', overflowY: 'auto', overflowX: 'hidden' }}>
       <h4>
         <img 
           alt="EFSA Logo"
           className=""
           style={{ width: '35px', height: '35px', float: 'left' }}
           src={`${API_URL}/images/efsaLogo.png`}
         />
         &nbsp;EFSA Helsepåstander &nbsp;
         <OverlayTrigger data-trigger="hover" placement="right" overlay={popover}>
         <FontAwesomeIcon icon={faCircleInfo} onClick={openInfoLink} style={{ cursor: 'pointer', float: 'right', padding: '5px' }}/>     
         </OverlayTrigger>
       </h4>
       <hr/>
       <Row className="mb-3">
       <Col xs={12} md={6}>
         <label htmlFor="vitamins" className="form-label">
           <strong>Kilde til Vitaminer</strong>
         </label>
         <CustomSelect
           isMulti
           placeholder={<div>Velg Vitaminer</div>}
           className="form-select-md"
           onChange={handleVitaminChange}
           options={selectVitamins}
         />
         {selectedVitamins.map((vitamin) => (
           <div key={vitamin.value} className="mt-2">
             <label htmlFor={`vitamin-input-${vitamin.value}`} className="form-label">
               Valgfri mengde {vitamin.label} 
             </label>
             <div className="input-group">
             <input
               type="text"
               className="form-control"
               id={`vitamin-input-${vitamin.value}`}
               value={vitaminInputValues[vitamin.value] || ''}
               onChange={(e) => handleVitaminInputChange(vitamin.value, e.target.value)}
               placeholder={`${vitamin.label}`}
             />
             <select
               className="form-select"
               value={vitaminUnits[vitamin.value] || 'mg'}
               onChange={(e) => handleVitaminUnitChange(vitamin.value, e.target.value)}
               style={{flex: '0 0 25%'}}
             >
               <option value="mg">mg</option>
               <option value="µg">µg</option>
             </select>
             </div>
           </div>
         ))}
       </Col>
       <Col xs={12} md={6}>
         <label htmlFor="minerals" className="form-label">
           <strong>Kilde til Mineraler</strong>
         </label>
         <CustomSelect
           isMulti
           placeholder={<div>Velg Mineraler</div>}
           className="form-select-md"
           onChange={handleMineralChange}
           options={selectMinerals}
         />
         {selectedMinerals.map((mineral) => (
           <div key={mineral.value} className="mt-2">
             <label htmlFor={`mineral-input-${mineral.value}`} className="form-label">
               Valgfri mengde {mineral.label}
             </label>
             <div className="input-group">
             <input
               type="text"
               className="form-control"
               id={`mineral-input-${mineral.value}`}
               value={mineralInputValues[mineral.value] || ''}
               onChange={(e) => handleMineralInputChange(mineral.value, e.target.value)}
               placeholder={`${mineral.label}`}
             />
             <select
               style={{flex: '0 0 25%'}}
               className="form-select"
               value={mineralUnits[mineral.value] || 'mg'}
               onChange={(e) => handleMineralUnitChange(mineral.value, e.target.value)}
             >
               <option value="mg">mg</option>
               <option value="µg">µg</option>
             </select>
             </div>
           </div>
         ))}
       </Col>
     </Row>
     <br/>
     <Row className="mb-3" >
       <Col>
         <label htmlFor="others" className="form-label">
           <strong>Kilde til Annet</strong>
         </label>
         <CustomSelect
           isMulti
           placeholder={<div>Velg Andre</div>}
           className="form-select-md"
           onChange={handleOtherChange}
           options={selectOthers}
         />
         {selectedOthers.map((other) => (
           <div key={other.value} className="mt-2">
             <label htmlFor={`other-input-${other.value}`} className="form-label">
               Mengde {other.label}
             </label>
             <div className="input-group">
             <input
               type="text"
               className="form-control"
               id={`other-input-${other.value}`}
               value={otherInputValues[other.value] || ''}
               onChange={(e) => handleOtherInputChange(other.value, e.target.value)}
               placeholder={`${other.label}`}
             />
             <span className="input-group-text">g</span>
             
             </div>
           </div>
         ))}
       </Col>
     </Row>
     <br/>
     <Row className="mb-3">
       <Col>
         <label htmlFor="reqs" className="form-label">
           <strong>Møter EFSA Næringskrav</strong>
         </label>
         <CustomSelect
           isMulti
           placeholder={<div>Velg Muligheter</div>}
           className="form-select-md"
           onChange={setSelectedMeetsReqs}
           options={filteredOptions}
           value={selectedMeetsReqs}
         />
         {selectedMeetsReqs.map((meetsReqs) => (
           <div key={meetsReqs.value} className="mt-2">
             <label htmlFor={`meetsReqs-input-${meetsReqs.value}`} className="form-label">
               Mengde {meetsReqs.label}
             </label>
             <input
               type="text"
               className="form-control"
               id={`meetsReqs-input-${meetsReqs.value}`}
               value={meetsReqsInputValues[meetsReqs.value] || ''}
               onChange={(e) => handleMeetsReqsInputChange(meetsReqs.value, e.target.value)}
               placeholder={`${meetsReqs.label} (g)`}
             />
           </div>
         ))}
       </Col>
     </Row>
     </Container>
     </div>

);
};

export default HealthClaimsInputs;