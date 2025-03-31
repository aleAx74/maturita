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

    const filePath = `server/filesPDF/${nome}.pdf`;
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
        // Ottieni tutti i documenti dal database
        const allDocuments = await filesModel.find({});
        
        // Crea una mappa strutturata di materie->argomenti->tags
        const knowledgeBase = {};
        allDocuments.forEach(doc => {
            if (!knowledgeBase[doc.materia]) {
                knowledgeBase[doc.materia] = {};
            }
            knowledgeBase[doc.materia][doc.nome] = doc.tags;
        });

        // Formatta la base di conoscenza per l'AI
        let formattedKnowledge = "";
        for (const [subject, topics] of Object.entries(knowledgeBase)) {
            formattedKnowledge += `\n## ${subject.toUpperCase()} ##\n`;
            for (const [topic, tags] of Object.entries(topics)) {
                formattedKnowledge += `- ${topic}: ${tags.join(', ')}\n`;
            }
        }

        const content = `
ANALISI INTERDISCIPLINARE DI IMMAGINE - LINEE GUIDA STRETTE:

1. IDENTIFICAZIONE PRIMARIA:
- Analizza l'immagine e identifica UN SOLO tema principale (persona, oggetto, concetto, evento)
- Determina il contesto preciso: storico, letterario, scientifico o tecnologico

2. CONNESSIONI INTERDISCIPLINARI (SOLO SE DIRETTAMENTE PERTINENTI):
- Materie da considerare: Storia, Italiano, Sistemi e Reti, GPOI, TPSI
- Per personaggi/opere: nome + periodo/movimento + collegamenti storici/filosofici
- Per concetti tecnologici: termine specifico + applicazioni pratiche
- Per eventi storici: cause + conseguenze + impatto tecnologico/culturale

3. REGOLE STRETTE PER I TAG:
- Massima pertinenza: NO a tag generici ("progresso", "tecnologia") senza legame diretto
- Personaggi: solo periodo letterario + movimenti culturali associati
- Opere: solo contesto storico + movimenti filosofici collegati
- Tecnologia: solo termini specifici (es. "firewall", non "sicurezza informatica")
- NO a inferenze speculative: solo ciò che è visibile/noto storicamente

4. BASE DI CONOSCENZA DISPONIBILE (USARE SOLO QUESTI TAG):
${formattedKnowledge}

5. FORMATTO DI RISPOSTA:
- Elenco di tag esatti presenti nel database
- Separati da virgola
- Solo minuscole
- Nessun commento aggiuntivo

ESEMPI CORRETTI:
- Immagine di Verga: "verismo, realismo, giovanni verga"
- Immagine di firewall: "firewall, dmz, sicurezza delle reti"
- Immagine Prima Guerra Mondiale: "prima guerra mondiale, trincea, sistema delle alleanze, comunicazioni"
`;

        const aiResponse = await main(url, content);
        console.log("\x1b[43mAI Response:", aiResponse, "\x1b[0m\n\n");

        // Pulizia e validazione della risposta
        let aiTags = aiResponse.toLowerCase()
            .split(',')
            .map(tag => tag.trim())
            .filter(tag => {
                // Verifica che il tag esista nel database
                for (const subject of Object.values(knowledgeBase)) {
                    for (const tags of Object.values(subject)) {
                        if (tags.includes(tag)) return true;
                    }
                }
                return false;
            });

        const query = { tags: { $in: aiTags } };
        const filesWithTags = await filesModel.find(query);

        res.json({ 
            files: filesWithTags,
            suggestedTags: aiTags 
        });
    } catch (error) {
        console.error("Errore durante l'elaborazione AI:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
app.listen(5000, () => {
    console.log('Server in esecuzione sulla porta 5000');
});
