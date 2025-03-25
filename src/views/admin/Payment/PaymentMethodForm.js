// Sửa component PaymentMethodForm.js
import React, { useEffect } from 'react';
import {
  Form,
  Input,
  Modal,
  Select,
  InputNumber,
  Switch,
  Tabs,
  Space,
  Divider,
  Typography
} from 'antd';

const { Option } = Select;
const { TextArea } = Input;
const { Title, Text } = Typography;

const PaymentMethodForm = ({ visible, onCancel, onSubmit, initialValues, isEditing }) => {
  const [form] = Form.useForm();

  // Reset form when modal opens/closes or when initialValues change
  useEffect(() => {
    if (visible) {
      form.resetFields();
      if (initialValues) {
        // Structure the form data properly
        const formData = {
          ...initialValues,
          configuration: initialValues.configuration || {},
          clientConfig: initialValues.clientConfig || {}
        };
        form.setFieldsValue(formData);
      }
    }
  }, [visible, initialValues, form]);

  // Handle form submission
  const handleSubmit = () => {
    form.validateFields()
      .then(values => {
        // Đảm bảo dữ liệu không bị undefined
        const formattedValues = {
          ...values,
          fee: values.fee ?? 0,
          feeType: values.feeType || 'fixed',
          isActive: values.isActive !== undefined ? values.isActive : true,
          sortOrder: values.sortOrder ?? 0,
          configuration: values.configuration || {},
          clientConfig: values.clientConfig || {}
        };
        onSubmit(formattedValues);
      })
      .catch(info => {
        console.log('Validate Failed:', info);
      });
  };

  const paymentTypes = [
    { value: 'cod', label: 'Thanh toán khi nhận hàng (COD)' },
    { value: 'bank_transfer', label: 'Chuyển khoản ngân hàng' },
    { value: 'e_wallet', label: 'Ví điện tử' },
    { value: 'online_payment', label: 'Thanh toán trực tuyến' }
  ];

  // Tạo items cho Tabs
  const tabItems = [
    {
      key: 'basic',
      label: 'Thông tin cơ bản',
      children: (
        <Space direction="vertical" style={{ width: '100%' }}>
          <Form.Item
            name="name"
            label="Tên phương thức thanh toán"
            rules={[
              { required: true, message: 'Vui lòng nhập tên phương thức thanh toán' }
            ]}
          >
            <Input placeholder="Ví dụ: Thanh toán khi nhận hàng (COD)" />
          </Form.Item>

          <Form.Item
            name="code"
            label="Mã phương thức"
            rules={[
              { required: true, message: 'Vui lòng nhập mã phương thức' },
              { pattern: /^[a-z0-9_]+$/, message: 'Chỉ cho phép chữ thường, số và dấu gạch dưới' }
            ]}
            tooltip="Mã dùng để xác định phương thức thanh toán trong hệ thống"
          >
            <Input placeholder="Ví dụ: cod, bank_transfer" disabled={isEditing} />
          </Form.Item>

          <Form.Item
            name="type"
            label="Loại phương thức"
            rules={[
              { required: true, message: 'Vui lòng chọn loại phương thức' }
            ]}
          >
            <Select placeholder="Chọn loại phương thức thanh toán">
              {paymentTypes.map(type => (
                <Option key={type.value} value={type.value}>{type.label}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
          >
            <TextArea rows={3} placeholder="Mô tả về phương thức thanh toán" />
          </Form.Item>

          <Form.Item
            name="instructions"
            label="Hướng dẫn thanh toán"
          >
            <TextArea rows={4} placeholder="Hướng dẫn chi tiết cách thanh toán" />
          </Form.Item>

          <Space size="large">
            <Form.Item
              name="fee"
              label="Phí"
              tooltip="Phí áp dụng cho phương thức thanh toán này"
            >
              <InputNumber
                min={0}
                step={1000}
                style={{ width: 150 }}
                addonAfter={<Form.Item name="feeType" noStyle>
                  <Select style={{ width: 80 }}>
                    <Option value="fixed">VND</Option>
                    <Option value="percentage">%</Option>
                  </Select>
                </Form.Item>}
              />
            </Form.Item>

            <Form.Item
              name="sortOrder"
              label="Thứ tự hiển thị"
              tooltip="Vị trí hiển thị, số nhỏ hơn hiển thị trước"
            >
              <InputNumber min={0} style={{ width: 100 }} />
            </Form.Item>

            <Form.Item
              name="isActive"
              label="Kích hoạt"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </Space>
        </Space>
      )
    },
    {
      key: 'configuration',
      label: 'Cấu hình',
      children: (
        <>
          <Divider orientation="left">Cấu hình phương thức thanh toán</Divider>

          <Form.Item shouldUpdate={(prevValues, currentValues) => prevValues.type !== currentValues.type}>
            {({ getFieldValue }) => {
              const type = getFieldValue('type');

              if (type === 'bank_transfer') {
                return (
                  <div className="bank-transfer-config">
                    <Title level={5}>Thông tin ngân hàng</Title>

                    <Form.Item
                      name={['configuration', 'bankName']}
                      label="Tên ngân hàng"
                    >
                      <Input placeholder="Ví dụ: Vietcombank" />
                    </Form.Item>

                    <Form.Item
                      name={['configuration', 'accountNumber']}
                      label="Số tài khoản"
                    >
                      <Input placeholder="Ví dụ: 1234567890" />
                    </Form.Item>

                    <Form.Item
                      name={['configuration', 'accountName']}
                      label="Tên chủ tài khoản"
                    >
                      <Input placeholder="Ví dụ: CÔNG TY TNHH ABC" />
                    </Form.Item>

                    <Form.Item
                      name={['configuration', 'branch']}
                      label="Chi nhánh"
                    >
                      <Input placeholder="Ví dụ: Chi nhánh Hà Nội" />
                    </Form.Item>
                  </div>
                );
              }

              if (type === 'online_payment' || type === 'e_wallet') {
                return (
                  <div className="online-payment-config">
                    <Title level={5}>Thông tin kết nối</Title>

                    <Form.Item
                      name={['configuration', 'merchantId']}
                      label="Merchant ID"
                    >
                      <Input placeholder="ID của đơn vị chấp nhận thanh toán" />
                    </Form.Item>

                    <Form.Item
                      name={['configuration', 'apiKey']}
                      label="API Key"
                    >
                      <Input.Password placeholder="Khóa API" />
                    </Form.Item>

                    <Form.Item
                      name={['configuration', 'secretKey']}
                      label="Secret Key"
                    >
                      <Input.Password placeholder="Khóa bí mật" />
                    </Form.Item>

                    <Form.Item
                      name={['configuration', 'environment']}
                      label="Môi trường"
                    >
                      <Select>
                        <Option value="sandbox">Thử nghiệm (Sandbox)</Option>
                        <Option value="production">Sản xuất (Production)</Option>
                      </Select>
                    </Form.Item>
                  </div>
                );
              }

              return (
                <Text type="secondary">
                  Không có cấu hình nâng cao cho phương thức thanh toán này.
                </Text>
              );
            }}
          </Form.Item>
        </>
      )
    },
    {
      key: 'client-config',
      label: 'Tùy chọn hiển thị',
      children: (
        <>
          <Divider orientation="left">Cấu hình giao diện</Divider>

          <Form.Item
            name={['clientConfig', 'requiresConfirmation']}
            label="Yêu cầu xác nhận từ khách hàng"
            valuePropName="checked"
            tooltip="Khách hàng cần xác nhận sau khi thanh toán (áp dụng cho chuyển khoản)"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name={['clientConfig', 'showIcon']}
            label="Hiển thị biểu tượng"
            valuePropName="checked"
            tooltip="Hiển thị biểu tượng phương thức thanh toán trên trang thanh toán"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name={['clientConfig', 'iconUrl']}
            label="URL biểu tượng"
            tooltip="Đường dẫn đến biểu tượng của phương thức thanh toán"
          >
            <Input placeholder="https://example.com/payment-icon.png" />
          </Form.Item>

          <Form.Item
            name={['clientConfig', 'displayInstructions']}
            label="Hiển thị hướng dẫn"
            valuePropName="checked"
            tooltip="Hiển thị hướng dẫn thanh toán sau khi khách hàng chọn phương thức này"
          >
            <Switch />
          </Form.Item>
        </>
      )
    }
  ];

  return (
    <Modal
      title={isEditing ? 'Cập nhật phương thức thanh toán' : 'Thêm phương thức thanh toán mới'}
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      width={800}
      okText={isEditing ? 'Cập nhật' : 'Thêm'}
      cancelText="Hủy"
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          isActive: true,
          fee: 0,
          feeType: 'fixed',
          type: 'cod',
          sortOrder: 0,
          configuration: {
            environment: 'sandbox'
          },
          clientConfig: {
            requiresConfirmation: false,
            showIcon: true,
            displayInstructions: true
          }
        }}
      >
        <Tabs defaultActiveKey="basic" items={tabItems} />
      </Form>
    </Modal>
  );
};

export default PaymentMethodForm;