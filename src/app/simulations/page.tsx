import React from "react";
import Filter from "@/components/main/filter";
import Card from "@/components/main/card";
import Link from "next/link";
import Button from "@/components/main/button";
import "./page.css";

const Groups = () => {
  const cards = Array(16).fill("Card");

  return (
    <div>
      <div className="button-container">
        <Link href="./simulations/createEditSimulation">
        <Button/>
        </Link>
      </div>
      <Filter count={6} />
      <Card items={cards} />
    </div>
  );
};

export default Groups;
