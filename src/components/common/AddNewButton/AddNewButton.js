import React from 'react';
import { Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types';
import './AddNewButton.scss';

const AddNewButton = ({ children, ...props }) => {
  return (
    <Button
      type="primary"
      icon={<PlusOutlined />}
      className="add-new-button"
      {...props}
    >
      {children}
    </Button>
  );
};

AddNewButton.propTypes = {
  children: PropTypes.node.isRequired,
  // Có thể thêm các prop khác nếu cần
};

export default AddNewButton;