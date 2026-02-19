const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();

// ======================
// CONFIGURAÇÕES
// ======================
app.use(cors());
app.use(express.json());

const JWT_SECRET = "segredo_super_seguro";

// ======================
// CONEXÃO MONGODB
// ======================
mongoose.connect("mongodb://127.0.0.1:27017/meusistema")
  .then(() => console.log("Banco conectado"))
  .catch(err => console.log(err));

// ======================
// MODEL USUÁRIO
// ======================
const User = mongoose.model("User", {
  username: String,
  email: String,
  password: String,
  vip: { type: Boolean, default: false }
});

// ======================
// ROTA PRINCIPAL
// ======================
app.get("/", (req, res) => {
  res.send("API rodando 🚀");
});

// ======================
// REGISTRO
// ======================
app.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "Email já cadastrado" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword
    });

    await newUser.save();

    res.json({ message: "Usuário criado com sucesso" });

  } catch (error) {
    res.status(500).json({ message: "Erro no servidor" });
  }
});

// ======================
// LOGIN
// ======================
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Usuário não encontrado" });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: "Senha incorreta" });
    }

    const token = jwt.sign(
      { id: user._id },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token });

  } catch (error) {
    res.status(500).json({ message: "Erro no servidor" });
  }
});

// ======================
// MIDDLEWARE AUTH
// ======================
function auth(req, res, next) {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ message: "Acesso negado" });
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch {
    res.status(400).json({ message: "Token inválido" });
  }
}

// ======================
// PAINEL PROTEGIDO
// ======================
app.get("/painel", auth, async (req, res) => {
  const user = await User.findById(req.user.id);

  res.json({
    username: user.username,
    email: user.email,
    vip: user.vip
  });
});

// ======================
// ATIVAR VIP
// ======================
app.post("/ativar-vip", auth, async (req, res) => {
  await User.findByIdAndUpdate(req.user.id, { vip: true });

  res.json({ message: "VIP ativado com sucesso" });
});

// ======================
// INICIAR SERVIDOR
// ======================
app.listen(3000, () => {
  console.log("Servidor rodando na porta 3000");
});
