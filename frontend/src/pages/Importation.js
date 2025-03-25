import React, { useState } from "react";
import Button from "../components/UI/Button";
import Alert from "../components/UI/Alert";

const Importation = () => {
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState([]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = () => {
    if (!file) {
      setErrors(["Veuillez sélectionner un fichier avant de l'importer."]);
      return;
    }
    // Simulation d'erreur
    setErrors(["Ligne 5 : Email invalide", "Ligne 12 : Ancienneté manquante"]);
  };

  return (
    <div className="container mt-5 bg-white shadow-md p-6 rounded-lg">
      <h2 className="text-primary text-3xl font-bold">Importation des Employés</h2>
      <div className="mt-4">
        <input type="file" className="border p-2 rounded-lg w-full" onChange={handleFileChange} />
        <Button onClick={handleUpload} className="mt-3">Importer</Button>
      </div>

      {errors.length > 0 && (
        <div className="mt-4">
          <Alert type="error" message="Erreurs détectées lors de l'importation :"/>
          <ul className="text-alert">
            {errors.map((err, index) => (
              <li key={index}>- {err}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Importation;
