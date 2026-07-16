const userService = require("../services/user.service");
const { signToken } = require("../utils/jwt");

const getUsers = async (req, res) => {
  try {
    const users = await userService.findAllUsers();
    res.status(200).json(users);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "internal server error" });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await userService.findUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }
    res.status(200).json(user);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "internal server error" });
  }
};

const postUsers = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "name, email and password are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "password must be at least 6 characters" });
    }

    const newUser = await userService.createUser({ name, email, phone, password });
    const token = signToken(newUser.id);
    res.status(201).json({ user: newUser, token });
  } catch (err) {
    console.log(err);
    if (err.code === "23505") {
      return res.status(409).json({ message: "email already registered" });
    }
    res.status(500).json({ message: "internal server error" });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "email and password are required" });
    }

    const user = await userService.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: "invalid email or password" });
    }

    const passwordMatches = await userService.verifyPassword(password, user.password);
    if (!passwordMatches) {
      return res.status(401).json({ message: "invalid email or password" });
    }

    const token = signToken(user.id);
    res.status(200).json({
      user: { id: user.id, name: user.name, email: user.email, phone: user.phone },
      token,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "internal server error" });
  }
};

module.exports = { getUsers, getUserById, postUsers, loginUser };
