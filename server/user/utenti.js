import { utentiModel } from '../../database/connessione.js';
import { generateToken } from './token.js';
import mandaemail from './email.js';


export const registerUser = async (req, res) => {
  try {
    const { username, email, password} = req.body;
    const existingUser = await utentiModel.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: 'Email già registrata' });
    }

    const nuovoUtente = new utentiModel({ username, email, password});
    await nuovoUtente.save();

    res.status(201).json({ message: 'Registrazione avvenuta con successo' });
    mandaemail(email, username)
      .then(() => console.log('Email inviata con successo'))
      .catch(err => console.error('Errore nell\'invio dell\'email:', err));
  } catch (error) {
    res.status(500).json({ message: 'Errore durante la registrazione', error });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const utente = await utentiModel.findOne({ email });

    if (!utente || !(await utente.matchPassword(password))) {
      return res.status(401).json({ message: 'Email o password errata' });
    }

    const token = generateToken(utente);
    res.json({ message: 'Login riuscito', token });
  } catch (error) {
    res.status(500).json({ message: 'Errore durante il login', error });
  }
};
