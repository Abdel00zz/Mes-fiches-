
import React, { useState, useEffect } from 'react';
import { SheetState } from './types';
import { Dashboard } from './components/Dashboard';
import { Editor } from './components/Editor';
import { loadSheet, saveSheet } from './utils/storage';

const EMPTY_STATE: SheetState = {
  id: '',
  title: "Nouvelle Fiche",
  subtitle: "Sous-titre",
  blocks: []
};

export default function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'editor'>('dashboard');
  const [currentSheetId, setCurrentSheetId] = useState<string | null>(null);
  const [loadedSheet, setLoadedSheet] = useState<SheetState>(EMPTY_STATE);
  const [isInitializing, setIsInitializing] = useState(true);

  // Infrastructure: Seeding LocalStorage from Manifest
  useEffect(() => {
    const initializeApp = async () => {
        try {
          const response = await fetch('/manifest.json');
          if (!response.ok) throw new Error("Manifest failed to load");
          
          const manifest = await response.json();
          const resources = manifest.resources?.initialSheets || [];

          // Process sequentially to ensure storage integrity
          for (const resource of resources) {
             // Check if this specific ID already exists in LocalStorage
             // If it exists, we DO NOT overwrite it, preserving user edits.
             // If it doesn't exist, we fetch and save it.
             const existing = loadSheet(resource.id);
             
             if (!existing) {
                 try {
                     const res = await fetch(resource.url);
                     const data = await res.json();
                     // Save with the specific ID from manifest to track it
                     saveSheet({ ...data, id: resource.id }, resource.id);
                 } catch (err) {
                     console.warn(`Failed to seed resource: ${resource.url}`, err);
                 }
             }
          }
        } catch (error) {
          console.error("Infrastructure Error: Could not scan app engine.", error);
        } finally {
          setIsInitializing(false);
        }
    };

    initializeApp();
  }, []);

  const handleOpenSheet = (id: string) => {
    const sheet = loadSheet(id);
    if (sheet) {
      setLoadedSheet(sheet);
      setCurrentSheetId(id);
      setCurrentView('editor');
    } else {
      alert("Impossible de charger la fiche. Données corrompues.");
    }
  };

  const handleCreateSheet = () => {
    const newSheet = { ...EMPTY_STATE, id: Date.now().toString() };
    setLoadedSheet(newSheet);
    setCurrentSheetId(null); // Will be saved with new ID on first save
    setCurrentView('editor');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setCurrentSheetId(null);
  };

  if (isInitializing) {
      return (
          <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
              <div className="animate-pulse flex flex-col items-center gap-4">
                  <div className="w-12 h-12 bg-slate-200 rounded-full"></div>
                  <div className="text-slate-400 font-medium text-sm">Chargement de la bibliothèque...</div>
              </div>
          </div>
      );
  }

  if (currentView === 'dashboard') {
    return <Dashboard onOpen={handleOpenSheet} onCreate={handleCreateSheet} />;
  }

  return <Editor initialState={loadedSheet} onBack={handleBackToDashboard} />;
}
