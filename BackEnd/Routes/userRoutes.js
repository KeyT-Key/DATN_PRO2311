// routes/userRoutes.js
const express = require('express');
const User = require('../Models/User');
const router = express.Router();

// Đăng ký người dùng
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Kiểm tra người dùng đã tồn tại chưa
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Email đã tồn tại' });
    }

    // Tạo người dùng mới
    const newUser = new User({
      username,
      email,
      password
    });

    await newUser.save();
    res.status(201).json({ message: 'Đăng ký thành công', userId: newUser._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Lấy danh sách người dùng
router.get('/', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

module.exports = router;
