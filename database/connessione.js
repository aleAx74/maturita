import mongoose from "mongoose";
import bcrypt from "bcryptjs";


const mongoURI = "mongodb+srv://mongo_alessandro:E1jkbfsFxY5f9b8n@cluster0.7gzgv.mongodb.net/maturita?retryWrites=true&w=majority&appName=Cluster0";
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Database connesso...");
  })
  .catch((error) => {
    console.log("Errore di connessione:", error);
  });

const filesSchema = new mongoose.Schema({
  nome: { 
    type: String, 
    required: true 
  },
  materia: {
    type: String,
    required: true
  },
  tags:{
    type: Array
  }
});

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user' 
  }
});

userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const filesModel = mongoose.model("files", filesSchema);
const utentiModel = mongoose.model("utenti", userSchema);

export { filesModel, utentiModel };
