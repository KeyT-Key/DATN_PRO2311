// Lắng nghe sự kiện click trên nút đăng xuất
document.getElementById('logoutbtn').addEventListener('click', function () {
    // Xóa thông tin userID khỏi localStorage
    localStorage.removeItem('userID');
    console.log('Đã đăng xuất thành công');
    
    // Chuyển hướng người dùng về trang đăng nhập hoặc trang chủ
    window.location.replace('/');  // Hoặc '/';
  });
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