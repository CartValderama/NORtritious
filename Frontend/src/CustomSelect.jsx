// CustomSelect.js
import React from 'react';
import Select from 'react-select';

const CustomSelect = (props) => {
  const customStyles = {
    placeholder: (defaultStyles) => ({
      ...defaultStyles,
      color: '#363636', // Setting the color of placeholder text
    }),
    // Define additional custom styles if needed
  };

  return <Select styles={customStyles} {...props} />;
};

export default CustomSelect;
