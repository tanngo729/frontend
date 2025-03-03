import React from 'react';
import { Button } from 'antd';
import PropTypes from 'prop-types';
import './CommonButton.scss';

const CommonButton = ({
  type = 'default',
  size = 'medium',
  icon,
  children,
  className,
  ...props
}) => {
  return (
    <Button
      className={`common-button ${type} ${size} ${className}`}
      icon={icon}
      {...props}
    >
      {children}
    </Button>
  );
};

CommonButton.propTypes = {
  type: PropTypes.oneOf(['primary', 'secondary', 'danger', 'default']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  icon: PropTypes.node,
  className: PropTypes.string,
  children: PropTypes.node
};

export default CommonButton;