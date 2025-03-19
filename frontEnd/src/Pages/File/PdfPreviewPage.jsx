import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './PdfPreviewPage.css';

const PdfPreviewPage = () => {
  const { nome } = useParams();
  const [pdfUrl, setPdfUrl] = useState(null);
  const [tags, setTags] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPdfFile = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/files/${nome}`);
        if (!response.ok) {
          throw new Error('Failed to fetch file details');
        }
        const data = await response.json();
        console.log('Fetched data:', data);
        setTags(data.tags || []);

        const pdfResponse = await fetch(`http://localhost:5000/api/scarica?nome=${nome}`);
        if (!pdfResponse.ok) {
          throw new Error('Failed to fetch PDF file');
        }
        const blob = await pdfResponse.blob();
        const url = URL.createObjectURL(blob) + '#navpanes=0&zoom=60';
        setPdfUrl(url);
      } catch (error) {
        console.error('Error fetching file details:', error);
      }
    };

    fetchPdfFile();
  }, [nome]);

  const handleBack = () => {
    navigate('/documents');
  };

  return (
    <div className="pdf-preview-page">
      <button onClick={handleBack} className="back-button">
        Back to Documents
      </button>

      <div className="preview-container">
        {pdfUrl ? (
          <iframe
            src={pdfUrl}
            width="100%"
            height="600px"
            title="PDF Preview"
          />
        ) : (
          <p>Loading PDF...</p>
        )}

        <div className="tags-section">
          <h3>Tags:</h3>
          <ul>
            {tags.map((tag, index) => (
              <li key={index}>{tag}</li>
            ))}
          </ul>
          <a href={pdfUrl} download={`${nome}.pdf`} className="download-button">
            Download PDF
          </a>
        </div>
      </div>
    </div>
  );
};

export default PdfPreviewPage;