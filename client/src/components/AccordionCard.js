import React from 'react'

import Select from 'react-select';
import 'react-select/dist/react-select.css';

const AccordionCard = (props) => {

  const {
    headingId,
    heading,
    collapseId,
    selectValue,
    selectChange,
    selectOptions,
    inputPlaceholder,
    inputChange,
    inputValue,
    confirm,
    confirmed,
    modelNeeded,
    doingTraining
  } = props

  const headingText = confirmed ? `Chosen ${heading}: ${confirmed}` : `Choose ${heading}`
  const buttonStyle = modelNeeded ? 'btn-secondary' : confirmed ? 'btn-primary' : 'btn-warning'

  const collapse = (modelNeeded || confirmed) ? 'collapse' : 'collapse.show'

  return (
    <div className="card">
      <div className="card-header" id={headingId}>
        <h5 className="mb-0">
          <button className={`btn btn-block btn-training ${buttonStyle}`}
                  data-toggle={'collapse'}
                  data-target={`#${collapseId}`}
                  aria-expanded={false}
                  aria-controls={collapseId}
                  disabled={modelNeeded || doingTraining}>
            {headingText}
          </button>
        </h5>
      </div>

      <div id={collapseId}
           className={collapse}
           aria-labelledby={headingId}
           data-parent="#accordion">
        <div className="card-body">
          <div className="container">
            <div className="row">
              <div className="col">
                <Select
                  className=""
                  name="form-field-name"
                  value={selectValue}
                  onChange={selectChange}
                  options={selectOptions}
                />
              </div>
              <span style={{paddingTop: '7px'}}>OR</span>
              <div className="col">
                <div className="input-group mb-3">
                  <input type="text"
                          className="form-control"
                          placeholder={inputPlaceholder}
                          aria-label={inputPlaceholder}
                          aria-describedby="basic-addon2"
                          onChange={inputChange}
                          value={inputValue} />
                  <div className="input-group-append">
                    <button className="btn btn-outline-secondary"
                            type="button"
                            onClick={() => confirm(inputValue)}>Confirm</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AccordionCard
