"use client";
import React, { useState } from "react";
import "./page.css";
import Button from "@/components/main/button";
import { Plus, Edit, Trash2 } from "lucide-react";

const CreateEditSimulation = () => {
  const [simulationName, setSimulationName] = useState("");
  const [search, setSearch] = useState("");

  const questions = [
    {
      id: "1",
      question: "Qual é a capital da França?",
      options: ["Londres", "Paris", "Berlim", "Madri"],
      correctAnswer: "Paris",
      justification: "Paris é a capital da França."
    },
    {
      id: "2",
      question: "Qual é o maior planeta do sistema solar?",
      options: ["Terra", "Marte", "Júpiter", "Vênus"],
      correctAnswer: "Júpiter",
      justification: "Júpiter é o maior planeta do sistema solar."
    },
    {
      id: "3",
      question: "Quem desenvolveu a teoria da relatividade?",
      options: ["Isaac Newton", "Albert Einstein", "Nikola Tesla", "Galileu Galilei"],
      correctAnswer: "Albert Einstein",
      justification: "Albert Einstein desenvolveu a teoria da relatividade."
    }
  ];

  return (
    <div className="create-simulation-container">
      <label htmlFor="simulation-name">Digite o nome do simulado:</label>
      <div className="input-button-container">
        <input
          type="text"
          id="simulation-name"
          value={simulationName}
          onChange={(e) => setSimulationName(e.target.value)}
          placeholder="Nome do simulado"
        />
        <Button />
      </div>

      <div className="header-container">
        <p>Questões:</p>
        <button className="add-button">
          <Plus size={20} />
        </button>
      </div>

      <div className="input-button-container">
        <input
          type="text"
          placeholder="Filtrar questões"
          onChange={(e) => setSearch(e.target.value.toLowerCase())}
        />
      </div>

      <div className="questions-list">
        {questions
          .filter(q => q.question.toLowerCase().includes(search))
          .map((q) => (
            <div key={q.id} className="question-card">
              <div className="question-header">
                <h3>{q.question}</h3>
                <div className="actions">
                  <button className="edit-button">
                    <Edit size={18} />
                  </button>
                  <button className="delete-button">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <ul>
                {q.options.map((option, index) => (
                  <li 
                    key={index} 
                    className={`option ${option === q.correctAnswer ? "correct" : ""}`}
                  >
                    {option}
                  </li>
                ))}
              </ul>
              <p className="justification"><strong>Justificativa:</strong> {q.justification}</p>
            </div>
          ))}
      </div>
    </div>
  );
};

export default CreateEditSimulation;
