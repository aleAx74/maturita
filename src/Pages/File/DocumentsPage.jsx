import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './DocumentsPage.css';

const DocumentsPage = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await fetch('https://maturita.onrender.com/api/files');
        if (!response.ok) {
          throw new Error('Failed to fetch files');
        }
        const data = await response.json();
        setFiles(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, []);

  const groupedFiles = files.reduce((acc, file) => {
    const { materia, nome } = file;
    if (!acc[materia]) {
      acc[materia] = [];
    }
    acc[materia].push(nome);
    return acc;
  }, {});

  const handleFileClick = (nome) => {
    navigate(`/pdf-preview/${nome}`);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="documents-page">
      <header className="header">
        <h1>I Tuoi Documenti</h1>
        <p>Organizza e accedi ai tuoi documenti in modo semplice e veloce.</p>
      </header>

      <section className="document-categories">
        {Object.keys(groupedFiles).map((materia) => (
          <div className="category" key={materia}>
            <h2>{materia}</h2>
            <div className="document-list">
              {groupedFiles[materia].map((nome, index) => (
                <div
                  className="document-item"
                  key={index}
                  onClick={() => handleFileClick(nome)}
                >
                  {nome}
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
};

export default DocumentsPage;