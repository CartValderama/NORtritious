// CustomSelect.js
import React from 'react';
import Select from 'react-select';

const CustomSelect = (props) => {
  // Currently not being used to accomodate for selectors that have high z-index
  const customStyles = {
    placeholder: (defaultStyles) => ({
      ...defaultStyles,
      color: '#363636', // Setting the color of placeholder text
    }),
    // Define additional custom styles if needed
  };

  return (<Select  {...props} menuPortalTarget={document.body}
    styles={{
    menuPortal: base => ({ ...base, zIndex: 9999 }), // Setting the z-index of the menu portal
    ...props.styles,
  }} />
);
};

export default CustomSelect;
