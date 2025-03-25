// src/utils/orderPrintUtils.js

/**
 * Generate HTML content for printing an order
 * 
 * @param {Object} order - Order data
 * @param {Function} formatDate - Date formatting function
 * @param {Function} formatCurrency - Currency formatting function
 * @returns {string} - HTML content for printing
 */
export const generatePrintContent = (order, formatDate, formatCurrency) => {
  // Status configuration
  const STATUS_CONFIG = {
    pending: { label: 'Chờ xác nhận' },
    processing: { label: 'Đang xử lý' },
    shipped: { label: 'Đang giao hàng' },
    delivered: { label: 'Đã giao hàng' },
    cancelled: { label: 'Đã hủy' }
  };

  // Payment status configuration
  const PAYMENT_STATUS_CONFIG = {
    pending: { label: 'Chờ thanh toán' },
    paid: { label: 'Đã thanh toán' },
    failed: { label: 'Thanh toán thất bại' }
  };

  // Generate items HTML
  const itemsHtml = (order.items || []).map(item => `
    <tr>
      <td>${(item.productId && item.productId.name) || 'Sản phẩm không còn tồn tại'}</td>
      <td>${formatCurrency(item.price)}</td>
      <td>${item.quantity || 0}</td>
      <td>${formatCurrency((item.price || 0) * (item.quantity || 0))}</td>
    </tr>
  `).join('');

  // Generate note HTML if exists
  const noteHtml = order.shippingInfo?.note
    ? `<p><strong>Ghi chú:</strong> ${order.shippingInfo.note}</p>`
    : '';

  // Generate full HTML content
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Đơn hàng #${order._id ? order._id.slice(-6) : ''}</title>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.5; margin: 20px; }
        .header { text-align: center; margin-bottom: 20px; }
        .order-info { margin-bottom: 20px; }
        .customer-info { margin-bottom: 20px; }
        .shipping-info { margin-bottom: 20px; }
        .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        .total { text-align: right; margin-top: 20px; font-weight: bold; }
        .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; }
        @media print {
          button { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Đơn hàng #${order._id ? order._id.slice(-6) : ''}</h1>
        <p>Ngày đặt: ${formatDate(order.createdAt)}</p>
      </div>
      
      <div class="order-info">
        <h2>Thông tin đơn hàng</h2>
        <p><strong>Trạng thái:</strong> ${STATUS_CONFIG[order.status]?.label || order.status || 'N/A'}</p>
        <p><strong>Thanh toán:</strong> ${PAYMENT_STATUS_CONFIG[order.paymentStatus]?.label || order.paymentStatus || 'N/A'}</p>
      </div>
      
      <div class="customer-info">
        <h2>Thông tin khách hàng</h2>
        <p><strong>Khách hàng:</strong> ${order.userDetails?.fullName || order.userId?.fullName || 'N/A'}</p>
        <p><strong>Email:</strong> ${order.userDetails?.email || order.userId?.email || 'N/A'}</p>
        <p><strong>Điện thoại:</strong> ${order.userDetails?.phone || order.userId?.phone || 'N/A'}</p>
      </div>
      
      <div class="shipping-info">
        <h2>Thông tin giao hàng</h2>
        <p><strong>Người nhận:</strong> ${order.shippingInfo?.name || 'N/A'}</p>
        <p><strong>Điện thoại:</strong> ${order.shippingInfo?.phone || 'N/A'}</p>
        <p><strong>Địa chỉ:</strong> ${order.shippingInfo?.address || 'N/A'}</p>
        ${noteHtml}
      </div>
      
      <h2>Chi tiết đơn hàng</h2>
      <table class="items-table">
        <thead>
          <tr>
            <th>Sản phẩm</th>
            <th>Đơn giá</th>
            <th>Số lượng</th>
            <th>Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>
      
      <div class="total">
        <p>Tổng cộng: ${formatCurrency(order.totalPrice)}</p>
      </div>
      
      <div class="footer">
        <p>In ngày: ${new Date().toLocaleString('vi-VN')}</p>
      </div>
      
      <div style="text-align: center; margin-top: 20px;">
        <button onclick="window.print()">In đơn hàng</button>
      </div>
    </body>
    </html>
  `;
};