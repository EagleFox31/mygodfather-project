import React, { useState, useEffect } from "react";

const MentoratList = () => {
  const [mentorats, setMentorats] = useState([]);

  useEffect(() => {
    setMentorats([
      { id: 1, mentor: "Jean Dupont", mentoré: "Alice Martin", statut: "Actif" },
      { id: 2, mentor: "Sophie Lambert", mentoré: "Marc Durand", statut: "En attente" }
    ]);
  }, []);

  return (
    <div>
      <h3>Mentorats</h3>
      <table className="table">
        <thead>
          <tr>
            <th>Mentor</th>
            <th>Mentoré</th>
            <th>Statut</th>
          </tr>
        </thead>
        <tbody>
          {mentorats.map((m) => (
            <tr key={m.id}>
              <td>{m.mentor}</td>
              <td>{m.mentoré}</td>
              <td>{m.statut}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MentoratList;
