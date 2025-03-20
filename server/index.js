import express from 'express';
import { registerUser, loginUser } from './user/utenti.js';
import { protect, authorize } from './user/token.js';
import { getAllFiles, getFileByMateria, addFile, deleteFile, getFileByName} from '../database/collezioneFile.js';
import { filesModel } from '../database/connessione.js';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";
import dotenv from 'dotenv';
dotenv.config();


const corsOption = {
    origin: ["https://maturita-1.onrender.com"]
};

const app = express();
app.use(cors(corsOption));
app.use(express.json());



const token = process.env.TOKEN;

export async function main(url, content) {
    const client = ModelClient(
        "https://models.inference.ai.azure.com",
        new AzureKeyCredential(token)
    );
   
    const response = await client.path("/chat/completions").post({
        body: {
            messages : [{
               role: "user", content: [{
               type: "image_url",
               image_url: {
                 url,
                 detail: "auto"
               }
             }]},
             {role: "user", content: content}],
             model: "gpt-4o"
         },
    });

    if (isUnexpected(response)) {
        throw response.body.error;
    }
    return response.body.choices[0].message.content;
}


app.post('/api/register', registerUser);
app.post('/api/login', loginUser);
app.get('/admin', protect, authorize('admin'), (req, res) => {
    res.send('Accesso alla sezione admin riuscito');
});

app.post('/api/files', async (req, res) => {
    try {
        const { nome, materia, tags } = req.body;
        const newFile = await addFile(nome, materia, tags);
        res.status(201).send(newFile);
    } catch (error) {
        console.error("Error adding file:", error);
        res.status(500).send("Internal Server Error");
    }
});

app.get('/api/files', async (req, res) => {
    try {
        const files = await getAllFiles();
        res.send(files);
    } catch (error) {
        console.error("Error fetching files:", error);
        res.status(500).send("Internal Server Error");
    }
});

app.get('/api/files/:nome', async (req, res) => {
    try {
        const { nome } = req.params;
        const file = await getFileByName(nome);
        if (file) {
            res.send(file);
        } else {
            res.status(404).send("File not found");
        }
    } catch (error) {
        console.error("Error fetching file by name:", error);
        res.status(500).send("Internal Server Error");
    }
});

app.get('/api/files/materia/:materia', async (req, res) => {
    try {
        const { materia } = req.params;
        const files = await getFileByMateria(materia);
        res.send(files);
    } catch (error) {
        console.error("Error fetching files by materia:", error);
        res.status(500).send("Internal Server Error");
    }
});

app.get('/profile', protect, (req, res) => {
    res.send('Accesso al profilo riuscito');
});

app.get('/api/scarica', (req, res) => {
    const { nome } = req.query;

    if (!nome) {
        return res.status(400).send('File name is required');
    }

    const filePath = `filesPDF/${nome}.pdf`;
    console.log(filePath);
    if (!fs.existsSync(filePath)) {
        return res.status(404).send('File not found');
    }

    res.download(filePath, nome, (err) => {
        if (err) {
            console.error('Error downloading file:', err);
            res.status(500).send('Internal Server Error');
        }
    });
});
app.post('/api/AI', async (req, res) => {
    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ error: "URL is required" });
    }

    try {
        const files = await getAllFiles();
        const allTags = files.reduce((tags, file) => {
            if (file.tags && Array.isArray(file.tags)) {
                tags.push(...file.tags);
            }
            return tags;
        }, []);
        
        const uniqueTags = [...new Set(allTags)];

        const content = `
        Analizza l'immagine e trova i collegamenti interdisciplinari tra diverse materie, come se stessi preparando una tesina per la Maturità.
        
         - Identifica il tema principale e il suo contesto storico, letterario, scientifico o tecnologico.
         - Trova connessioni tra diverse materie (Storia, Italiano, sistemi e reti, GPOI, Informatica, TPSI).
         - Se è un personaggio storico o uno scrittore, indicane il nome e il periodo letterario, collega eventi, ideologie e movimenti culturali.
         - Se è un'opera letteraria, collega il contesto storico, movimenti filosofici e concetti moderni.
         - Se ci sono concetti chiave associabili all'immagine (es. "verismo", "progresso", "positivismo", "decadentismo", "estetismo", "futurismo", "modernismo").
         - Se raffigura un oggetto, descrivilo con parole chiave.
         - Se riguarda un concetto informatico o tecnologico (es. "DMZ", "firewall", "intelligenza artificiale", "cloud computing"), indica il termine specifico.
         - Se rappresenta una località geografica o un concetto militare, identificane il nome.
         - Rispondi solo con tag strettamente pertinenti all'immagine. Se è un personaggio, indica solo il suo periodo letterario e i movimenti culturali a cui è associato.
         - Se l'immagine mostra uno scrittore, non aggiungere argomenti tecnologici, economici o militari a meno che non siano direttamente collegati.
         - Non aggiungere termini come "modernismo", "positivismo", "ICT" o "sicurezza informatica" se non strettamente pertinenti.
         - Evita di fare inferenze speculative; concentrati solo su ciò che è visibile e noto.

        
         Rispondi solo con una lista di tag separati da virgole. Ecco alcuni esempi di tag già esistenti nel database: ${uniqueTags.join(', ')}.
         `;


        const aiResponse = await main(url, content);
        console.log("\x1b[43mAI Response:", aiResponse, "\x1b[0m\n\n");

        let aiTags = aiResponse.split(',').map(tag => tag.trim().toLowerCase()); 

        const query = { tags: { $in: aiTags } };
        const filesWithTags = await filesModel.find(query);

        res.json({ files: filesWithTags });
    } catch (error) {
        console.error("Errore durante l'elaborazione AI:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
app.listen(5000, () => {
    console.log('Server in esecuzione sulla porta 5000');
});
