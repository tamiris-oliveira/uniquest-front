"use client";
import React from "react";
import Link from "next/link";
import { Edit, Trash2 } from "lucide-react";
import "./card.css";

interface Item {
  [key: string]: any;
}

interface CardProps {
  items: Item[];
  route: string;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
  linkOnClick?: boolean; 
}

const Card = ({ items, route, onEdit, onDelete, linkOnClick = true }: CardProps) => {
  return (
    <div className="card-group">
      {items.map((item, index) => {
        const cardContent = (
          <div className="card">
            <div className="card-actions">
              {onEdit && (
                <Edit
                  size={18}
                  className="icon"
                  onClick={(e) => {
                    e.preventDefault();
                    onEdit(item.id);
                  }}
                />
              )}
              {onDelete && (
                <Trash2
                  size={18}
                  className="icon delete"
                  onClick={(e) => {
                    e.preventDefault();
                    onDelete(item.id);
                  }}
                />
              )}
            </div>
            {Object.keys(item).map((key) => (
              <div key={key} className="card-property">
                <strong>{key}: </strong>
                {String(item[key])}
              </div>
            ))}
          </div>
        );

        return linkOnClick ? (
          <Link key={index} href={`/${route}/${item.id}`}>
            {cardContent}
          </Link>
        ) : (
          <div key={index}>{cardContent}</div>
        );
      })}
    </div>
  );
};

export default Card;
