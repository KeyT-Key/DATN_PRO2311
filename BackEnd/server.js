const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const { name } = require('ejs');
const validator = require('validator');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

const cors = require('cors');
const { type } = require('os');
app.use(cors());

// Cấu hình Express để sử dụng EJS làm template engine
app.set('view engine', 'ejs');
// Cấu hình thư mục views là thư mục frontend
app.set('views', path.join(__dirname, '../frontend'));

// Cấu hình thư mục public để phục vụ các tệp tĩnh
app.use(express.static(path.join(__dirname, '../frontend/public')));  // Đây là thư mục chứa index.css và index.js

// Kết nối MongoDB
mongoose.connect('mongodb+srv://test:test123@usershop.2k4so.mongodb.net/DATN_PRO231?retryWrites=true&w=majority')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log('MongoDB Connection Error: ', err));

// Tạo schema và model cho người dùng
const userSchema = new mongoose.Schema({
  userID: { type: String, default: uuidv4, required: true, unique: true },
  name: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = mongoose.model('User', userSchema, 'UserShop');

// Tạo schema và model cho sản phẩm
const productSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true},
  price: { type: Number, required: true },
  category: { type: String, required: true },
  imageUrl: { type: String },
  discount: { type: String },
  description: { type: String },
  products_number: { type: String },
});

const Product = mongoose.model('Product', productSchema, 'Products'); // Tạo model cho sản phẩm

// Schema giỏ hàng
const cartSchema = new mongoose.Schema({
  userID: { type: String, required: true },  // Mỗi người dùng có 1 userID duy nhất
  items: [{
    productID: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },  // ID sản phẩm
    name: { type: String, required: true },
    quantity: { type: Number, required: true, default: 1 },  // Số lượng sản phẩm
    price: { type: Number, required: true },  // Giá sản phẩm
    total: { type: Number, required: true },
  }],
  totalPrice: { type: Number, required: true, default: 0 },  // Tổng giá trị giỏ hàng
});

const Cart = mongoose.model('Cart', cartSchema, 'Carts');

// Route hiển thị form chính
app.get('/', (req, res) => {
  res.render('index');  // Render file index.ejs từ frontend
});

// Route hiển thị form đăng ký
app.get('/signup', (req, res) => {
  res.render('signUp');  // Render file signUp.ejs từ frontend
});

// Route hiển thị form đăng nhập
app.get('/login', (req, res) => {
  res.render('login');  // Render file login.ejs từ frontend
});

// Route hiển thị form giỏ hàng
app.get('/product_category', (req, res) => {
  res.render('product_category');  // Render file cart.ejs từ frontend
});

// Route hiển thị form danh mục sản phẩm
app.get('/cart', (req, res) => {
  res.render('cart');  // Render file product-category.ejs từ frontend
});

// Route hiển thị form thông tin sản phẩm
app.get('/product_information', (req, res) => {
  res.render('product_information');  // Render file product_information.ejs từ frontend
});

// Route hiển thị form thông tin người dùng
app.get('/user_information', (req, res) => {
  res.render('user_information');  // Render file user_information.ejs từ frontend
});

//API đăng ký người dùng
app.post('/register', async (req, res) => {
  console.log('Received data:', req.body); // Log ra dữ liệu nhận được từ client

  const { name, email, phone, password, confirmPassword } = req.body;

  // Kiểm tra các trường yêu cầu có được điền đầy đủ không
  if (!name || !email || !phone || !password || !confirmPassword) {
    return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin' });
  }

  // Kiểm tra định dạng email hợp lệ
  if (!validator.isEmail(email)) {
    return res.status(400).json({ message: 'Email không hợp lệ' });
  }

  // Kiểm tra tính hợp lệ của số điện thoại
  if (!validator.isMobilePhone(phone, 'vi-VN')) {
    return res.status(400).json({ message: 'Số điện thoại không hợp lệ' });
  }

  // Kiểm tra nếu email đã tồn tại
  const existingUserByEmail = await User.findOne({ email });
  if (existingUserByEmail) {
    return res.status(400).json({ message: 'Email đã tồn tại' });
  }

  // Kiểm tra nếu tên người dùng đã tồn tại
  const existingUserByName = await User.findOne({ name });
  if (existingUserByName) {
    return res.status(400).json({ message: 'Tên người dùng đã tồn tại' });
  }

  // Kiểm tra mật khẩu và mật khẩu xác nhận có trùng khớp không
  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Mật khẩu và mật khẩu xác nhận không trùng khớp' });
  }

  // Kiểm tra độ dài mật khẩu
  if (password.length < 6) {
    return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 6 ký tự' });
  }

  try {
    // Mã hóa mật khẩu
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Tạo người dùng mới
    const newUser = new User({
      name,
      email,
      phone,
      password: hashedPassword,
    });

    // Lưu người dùng vào cơ sở dữ liệu
    const savedUser = await newUser.save();
    console.log('User saved:', savedUser); // Log ra dữ liệu đã lưu

    // Trả về thông báo đăng ký thành công
    res.status(201).json({ message: 'Đăng ký thành công' });
  } catch (error) {
    console.error('Error occurred:', error); // Log chi tiết lỗi
    res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
  }
});

// API đăng nhập người dùng
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Kiểm tra các trường yêu cầu có được điền đầy đủ không
  if (!email || !password) {
    return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin' });
  }

  try {
    // Tìm người dùng trong cơ sở dữ liệu bằng email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Email hoặc mật khẩu không chính xác' });
    }

    // So sánh mật khẩu đã mã hóa với mật khẩu người dùng nhập vào
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Email hoặc mật khẩu không chính xác' });
    }

    // Đăng nhập thành công, gửi thông tin người dùng bao gồm userID
    res.status(200).json({ 
      message: 'Đăng nhập thành công', 
      user: { 
        userID: user.userID,
        name: user.name, 
        email: user.email 
      } 
    });
  } catch (error) {
    console.error('Error occurred:', error);
    res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
  }
});

// API hiển thị danh sách sản phẩm gợi ý
app.get('/products', async (req, res) => {
  try {
    const products = await Product.find().limit(5);
    // console.log('Sản phẩm lấy từ MongoDB:', products);  // Thêm log để kiểm tra dữ liệu trả về
    if (products.length === 0) {
      return res.status(404).json({ message: 'Không có sản phẩm nào' });
    }
    res.status(200).json({ products });
  } catch (error) {
    console.error('Lỗi xảy ra:', error);
    res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
  }
});

// API hiển thị danh sách sản phẩm
app.get('/products-list', async (req, res) => {
  try {
    const products = await Product.find();
    // console.log('Sản phẩm lấy từ MongoDB:', products);  // Thêm log để kiểm tra dữ liệu trả về
    if (products.length === 0) {
      return res.status(404).json({ message: 'Không có sản phẩm nào' });
    }
    // res.status(200).json({ products });
  } catch (error) {
    console.error('Lỗi xảy ra:', error);
    res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
  }
});

// API lấy chi tiết sản phẩm theo productID
app.get('/product_information/:id', async (req, res) => {
  const productId = req.params.id;
  try {
    const product = await Product.findById(productId);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy dữ liệu sản phẩm' });
  }
});

// API thêm sản phẩm vào giỏ hàng
app.post('/add_to_cart', async (req, res) => {
  const { userID, productID, quantity } = req.body;

  // Kiểm tra dữ liệu vào
  if (!userID || !productID || !quantity) {
    return res.status(400).json({ message: 'Vui lòng cung cấp đủ thông tin sản phẩm' });
  }

  try {
    const productObjectId = new mongoose.Types.ObjectId(productID);

    // Kiểm tra xem sản phẩm có tồn tại không
    const product = await Product.findById(productObjectId);
    if (!product) {
      return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
    }

    // Kiểm tra số lượng sản phẩm trong kho
    if (quantity > product.products_number) {
      return res.status(400).json({ message: `Không đủ số lượng sản phẩm ${product.name} trong kho` });
    }

    // Tìm giỏ hàng của người dùng
    let cart = await Cart.findOne({ userID });
    if (!cart) {
      // Nếu giỏ hàng chưa có, tạo mới
      cart = new Cart({
        userID,
        items: [{
          productID: product._id,
          name: product.name,
          price: product.price,
          quantity: quantity,
          total: product.price * quantity,
        }],
        totalPrice: product.price * quantity,
      });
    } else {
      // Nếu giỏ hàng đã có, thêm sản phẩm vào
      const existingItem = cart.items.find(item => item.productID.toString() === productObjectId.toString());

      if (existingItem) {
        existingItem.name = product.name;
        existingItem.quantity += quantity;
        existingItem.price = product.price;
        existingItem.total = existingItem.quantity *  existingItem.price;
      } else {
        cart.items.push({
          productID: product._id,
          name: product.name,
          price: product.price,
          quantity: quantity,
          total: product.price * quantity,
        });
      }

      // Cập nhật lại tổng giá trị giỏ hàng
      cart.totalPrice = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    // Lưu giỏ hàng vào MongoDB
    await cart.save();
    res.status(200).json({ message: 'Sản phẩm đã được thêm vào giỏ hàng', cart });
  } catch (error) {
    console.error('Lỗi khi thêm sản phẩm vào giỏ hàng:', error);  // Ghi lỗi chi tiết vào console
    res.status(500).json({ message: 'Lỗi khi thêm vào giỏ hàng', error: error.message });
  }
});

// API lấy giỏ hàng của người dùng
app.get('/cart/:userID', async (req, res) => {
  const { userID } = req.params;

  try {
    // Tìm giỏ hàng của người dùng theo userID
    const cart = await Cart.findOne({ userID });

    if (!cart) {
      return res.status(404).json({ message: 'Giỏ hàng của bạn chưa có sản phẩm' });
    }

    res.status(200).json({ cart });
  } catch (error) {
    console.error('Lỗi khi lấy giỏ hàng:', error);
    res.status(500).json({ message: 'Lỗi khi lấy giỏ hàng', error: error.message });
  }
});

// API xóa sản phẩm khỏi giỏ hàng
app.delete('/cart/:userID/remove/:productID', async (req, res) => {
  const { userID, productID } = req.params;

  try {
    const cart = await Cart.findOne({ userID });
    if (!cart) {
      return res.status(404).json({ message: 'Giỏ hàng không tồn tại' });
    }

    // Tìm và xóa sản phẩm trong giỏ hàng
    const productIndex = cart.items.findIndex(item => item.productID.toString() === productID);
    if (productIndex === -1) {
      return res.status(404).json({ message: 'Sản phẩm không tồn tại trong giỏ hàng' });
    }

    // Xóa sản phẩm khỏi giỏ hàng
    cart.items.splice(productIndex, 1);
    // Cập nhật lại tổng giá trị giỏ hàng
    cart.totalPrice = cart.items.reduce((total, item) => total + item.price, 0);

    // Lưu lại giỏ hàng
    await cart.save();
    res.status(200).json({ message: 'Sản phẩm đã được xóa khỏi giỏ hàng', cart });
  } catch (error) {
    console.error('Lỗi khi xóa sản phẩm:', error);
    res.status(500).json({ message: 'Lỗi khi xóa sản phẩm khỏi giỏ hàng', error: error.message });
  }
});

// // API thanh toán (mua hàng)
// app.post('/checkout', async (req, res) => {
//   const { userID } = req.body;

//   if (!userID) {
//     return res.status(400).json({ message: 'Vui lòng đăng nhập để thanh toán' });
//   }

//   try {
//     // Tìm giỏ hàng của người dùng
//     let cart = await Cart.findOne({ userID });
//     if (!cart) {
//       return res.status(404).json({ message: 'Giỏ hàng không tồn tại' });
//     }

//     // Duyệt qua các sản phẩm trong giỏ hàng để giảm số lượng trong cơ sở dữ liệu
//     for (const item of cart.items) {
//       const product = await Product.findById(item.productID);
//       if (product) {
//         // Giảm số lượng sản phẩm trong cơ sở dữ liệu
//         const newQuantity = product.products_number - item.quantity;
//         if (newQuantity < 0) {
//           return res.status(400).json({ message: `Không đủ số lượng sản phẩm ${product.name}` });
//         }

//         product.products_number = newQuantity;
//         await product.save();
//       }
//     }

//     // Xóa giỏ hàng sau khi thanh toán thành công
//     await Cart.deleteOne({ userID });

//     res.status(200).json({ message: 'Thanh toán thành công và giỏ hàng đã được làm trống' });
//   } catch (error) {
//     console.error('Lỗi khi thanh toán:', error);
//     res.status(500).json({ message: 'Lỗi khi thanh toán', error: error.message });
//   }
// });


// Chạy server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  const url = `http://localhost:${PORT}`;
  console.log(`Server is running on port ${PORT}`);
  console.log(`You can access the server at: ${url}`);
});
