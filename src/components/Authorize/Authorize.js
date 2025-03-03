import React from 'react';
import PropTypes from 'prop-types';
import useAuthorization from '../../hooks/Authorize';

const Authorize = ({ permission, children, fallback = null }) => {
  const isAuthorized = useAuthorization(permission);
  return isAuthorized ? children : fallback;
};

Authorize.propTypes = {
  permission: PropTypes.string.isRequired,
  children: PropTypes.node,
  fallback: PropTypes.node,
};

export default Authorize;
