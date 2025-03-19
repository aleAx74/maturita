import {filesModel} from "./connessione.js";

const addFile = async (nome, materia, tags) => {
    try {
      const newFile = new filesModel({ nome , materia, tags});
      await newFile.save();
      console.log("Nuovo file aggiunto:", newFile);
    } catch (error) {
      console.log("Errore nell'aggiungere il file:", error);
    }
  };
  
  const getAllFiles = async () => {
    try {
      const files = await filesModel.find({});
      return files;
    } catch (error) {
      console.log("Errore nel recuperare i file:", error);
      return [];
    }
  };
  
  const getFileByName = async (nome) => {
      try {
        const file = await filesModel.findOne({ nome: nome });
        return file; 
      } catch (error) {
        console.log("Errore nel recuperare il file per nome:", error);
        return null;
      }
    };
  
  const getFileByMateria = async (materia) => {
      try {
        const file = await filesModel.findOne({ materia: materia });
        return file; 
      } catch (error) {
        console.log("Errore nel recuperare il file per nome:", error);
        return null;
      }
    };

  
  const deleteFile = async (id) => {
    try {
      const deletedFile = await filesModel.findByIdAndDelete(id);
      return deletedFile;
    } catch (error) {
      console.log("Errore nell'eliminare il file:", error);
      return null;
    }
  };
  
  export {
    addFile,
    getAllFiles,
    getFileByName,
    getFileByMateria,
    deleteFile,
    filesModel
  };
  