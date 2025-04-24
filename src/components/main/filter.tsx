"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import "./filter.css";

interface Group {
  [key: string]: any;
}

interface FilterGroupProps {
  groups: Group[];
  onClickOutside: (filters: { [key: string]: string }) => void;
}

const FilterGroup = ({ groups, onClickOutside }: FilterGroupProps) => {
  const [filters, setFilters] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [prevFilters, setPrevFilters] = useState<{ [key: string]: string }>({});
  const filterRef = useRef<HTMLDivElement | null>(null);

  const filtersChanged = useCallback(() => {
    return JSON.stringify(filters) !== JSON.stringify(prevFilters);
  }, [filters, prevFilters]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        if (filtersChanged()) {
          setLoading(true);
          onClickOutside(filters); 
          setPrevFilters(filters); 
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [filters, onClickOutside, filtersChanged]);

  const fields = Array.from(new Set(groups.flatMap((group) => Object.keys(group))));

  const handleSelectChange = (field: string, value: string) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [field]: value,
    }));
  };

  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        setLoading(false);
      }, 1000); 
      return () => clearTimeout(timer);
    }
  }, [loading]);

  return (
    <div className="filter-group" ref={filterRef}>
      {loading ? (
        <div className="loading-spinner">Carregando...</div>
      ) : (
        fields.map((field) => (
          <select
            key={field}
            className="filter-select"
            value={filters[field] || ""}
            onChange={(e) => handleSelectChange(field, e.target.value)}
          >
            <option value="">Selecione {field}</option>
            {Array.from(new Set(groups.map((group) => group[field]))).map((value, index) => (
              <option key={index} value={value}>
                {value}
              </option>
            ))}
          </select>
        ))
      )}
    </div>
  );
};

export default FilterGroup;
