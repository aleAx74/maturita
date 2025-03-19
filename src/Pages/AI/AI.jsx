import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './AI.css';

const AI = () => {
  const [imageUrl, setImageUrl] = useState('');
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!imageUrl) {
      setError('Inserisci un URL valido.');
      return;
    }

    setLoading(true);
    setError(null);
    setDocuments([]); 

    try {
      const response = await fetch('https://maturita.onrender.com/api/AI', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: imageUrl }),
      });

      if (!response.ok) {
        throw new Error("Errore durante l'elaborazione dell'immagine.");
      }

      const data = await response.json();
      setDocuments(data.files);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const groupedDocuments = documents.reduce((acc, doc) => {
    if (!acc[doc.materia]) {
      acc[doc.materia] = [];
    }
    acc[doc.materia].push(doc);
    return acc;
  }, {});

  return (
    <div className="ai-page">
      <h1>AI Document Finder</h1>
      <p>Inserisci l'URL di un'immagine per ricevere i documenti relativi.</p>

      <form onSubmit={handleSubmit} className="ai-form">
        <input
          type="text"
          placeholder="Inserisci l'URL dell'immagine"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Elaborazione in corso...' : 'Cerca Documenti'}
        </button>
      </form>

      {error && <div className="error-message">{error}</div>}

      {imageUrl && (
        <div className="image-preview">
          <h3>Anteprima Immagine</h3>
          <img
            style={{ maxWidth: "60%", marginLeft: "50%", transform: "translateX(-50%)" }}
            src={imageUrl}
            alt="Anteprima immagine caricata"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/400x300?text=Immagine+non+disponibile';
            }}
          />
        </div>
      )}

      <div className="documents-list">
        {loading ? (
          <div className="loading-indicator">
            <div className="spinner"></div>
            <p>Stiamo elaborando la tua richiesta...</p>
          </div>
        ) : (
          Object.keys(groupedDocuments).length > 0 ? (
            Object.entries(groupedDocuments).map(([materia, docs], index) => (
              <div key={index} className="materia-group">
                <h2>{materia}</h2>
                {docs.map((doc, docIndex) => (
                  <div key={docIndex} className="document-item">
                    <h3>{doc.nome}</h3>
                    <p><strong>Tags:</strong> {doc.tags.join(', ')}</p>
                    <Link to={`/pdf-preview/${doc.nome}`} target="_blank" rel="noopener noreferrer">
                      Vedi Documento
                    </Link>
                  </div>
                ))}
              </div>
            ))
          ) : (
            <p>Nessun documento trovato.</p>
          )
        )}
      </div>
    </div>
  );
};

export default AI;