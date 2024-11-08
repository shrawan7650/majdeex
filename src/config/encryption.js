const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const hashData = async (data) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(data, salt);
};

const compareData = async (data, hashedData) => {
  return await bcrypt.compare(data, hashedData);
};
//create jsonwentoken



const generateToken = (user) => {
  console.log("generateTokenUSer",user)
  return jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

module.exports = { hashData, compareData,generateToken };
