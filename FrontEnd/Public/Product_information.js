
  // Quantity Controls
  const decreaseBtn = document.getElementById('decreaseBtn');
  const increaseBtn = document.getElementById('increaseBtn');
  const quantityInput = document.getElementById('quantityInput');

  decreaseBtn.addEventListener('click', () => {
      const currentValue = parseInt(quantityInput.value);
      if (currentValue > 1) {
          quantityInput.value = currentValue - 1;
      }
  });

  increaseBtn.addEventListener('click', () => {
      const currentValue = parseInt(quantityInput.value);
      quantityInput.value = currentValue + 1;
  });

// Lấy productId từ URL
const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get('id');  // Lấy đúng 'id' từ URL

// Gọi hàm để hiển thị thông tin sản phẩm
if (productId) {
  showProductInfo(productId);
} else {
  console.error('Không có productId trong URL');
}

// Hàm hiển thị thông tin chi tiết sản phẩm
function showProductInfo(productId) {
  fetch(`/product_information/${productId}`)  // Đảm bảo API nhận đúng id
    .then(response => {
      if (!response.ok) {
        throw new Error(`Lỗi HTTP! Mã trạng thái: ${response.status}`);
      }
      return response.json();
    })
    .then(product => {
      // Kiểm tra xem product có dữ liệu không
      if (product) {
        document.getElementById('product-name').innerText = product.name;
        document.getElementById('product-price').innerText = product.price.toLocaleString();
        document.getElementById('products_number').innerText = product.products_number;
        // document.getElementById('product-description').innerText = product.description;
        document.getElementById('mainImage').src = product.imageUrl;
      } else {
        console.error('Không tìm thấy sản phẩm');
      }
    })
    .catch(error => {
      console.error('Lỗi khi lấy chi tiết sản phẩm:', error);
    });
}

// Hàm thêm sản phẩm vào giỏ hàng
function addToCart() {
  // Lấy giá trị quantity từ input
  const quantity = parseInt(quantityInput.value) || 1; // Nếu không có giá trị, mặc định là 1

  // Lấy userID từ localStorage
  const userID = localStorage.getItem('userID');

  // Kiểm tra xem người dùng đã đăng nhập chưa
  if (!userID) {
    alert('Bạn cần đăng nhập trước khi thêm sản phẩm vào giỏ hàng!');
    return;
  }

  // Lấy productID từ URL (hoặc từ bất kỳ nguồn nào khác)
  const productID = new URLSearchParams(window.location.search).get('id');

  // Kiểm tra xem productID có hợp lệ không
  if (!productID) {
    console.error('Không tìm thấy productID trong URL');
    alert('Lỗi: Không có thông tin sản phẩm.');
    return;
  }

  // Kiểm tra dữ liệu trước khi gửi yêu cầu
  console.log('Product ID:', productID);
  console.log('User ID:', userID);
  console.log('Quantity:', quantity);

  // Gửi yêu cầu POST để thêm sản phẩm vào giỏ hàng
  fetch('/add_to_cart', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userID: userID,       // Lấy userID từ localStorage
      productID: productID, // Lấy productID từ URL
      quantity: quantity,   // Số lượng sản phẩm muốn thêm
    }),
  })
  .then(response => response.json())
  .then(data => {
    if (data.message) {
      alert(data.message); // Thông báo khi thêm thành công
    } else {
      alert('Sản phẩm đã được thêm vào giỏ hàng!');
    }
  })
  .catch(error => {
    console.error('Lỗi khi thêm sản phẩm vào giỏ hàng:', error);
    alert('Lỗi khi thêm sản phẩm vào giỏ hàng');
  });
}

// Thêm sự kiện click cho nút "Thêm Vào Giỏ Hàng"
const addToCartBtn = document.querySelector('.add-to-cart');
if (addToCartBtn) {
  addToCartBtn.addEventListener('click', addToCart);
}
// ẩn hiện user information
document.addEventListener('DOMContentLoaded', () => {
  const userID = localStorage.getItem('userID'); // Lấy userID từ localStorage (hoặc sessionStorage nếu muốn)
  
  // Các phần tử cần ẩn/hiện
  const khoanggiualink = document.getElementById('khoanggiua')
  const signupLink = document.getElementById('signup');
  const loginLink = document.getElementById('login');
  const userInfoLink = document.getElementById('user-information');
  
  // Kiểm tra nếu userID tồn tại, có nghĩa là người dùng đã đăng nhập
  if (userID) {
      // Ẩn Đăng Ký và Đăng nhập, hiển thị thông tin người dùng
      signupLink.style.display = 'none';
      khoanggiualink.style.display = 'none';
      loginLink.style.display = 'none';
      userInfoLink.style.display = 'inline'; // Hiển thị thông tin người dùng
  } else {
      // Nếu chưa đăng nhập, ẩn "Thông tin người dùng"
      userInfoLink.style.display = 'none';
  }
});