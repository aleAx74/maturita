import React from 'react';
import './Home.css';
import documentImage from '../assets/Home.png'; 
const Home = () => {
  return (
    <div className="home-container">
      <div className="home-content">
        <div className="home-text">
          <h1>Summary documents.</h1>
          <p>
          Benvenuto su SumDoc, la piattaforma perfetta per aiutarti a prepararti alla maturità! Qui troverai riassunti chiari e completi per ogni materia, pronti da scaricare per ottimizzare il tuo studio. Registrandoti, potrai accedere a contenuti esclusivi, salvare i tuoi documenti preferiti e studiare in modo più organizzato ed efficace. Iscriviti ora e affronta l’esame con sicurezza! 💪
          </p>
          <button className="cta-button">GET STARTED →</button>
        </div>
        <div className="home-image">
          <img src={documentImage} alt="Document" />
        </div>
      </div>
    </div>
  );
};

export default Home;