import PokemonTypeChecker from './components/PokemonTypeChecker';
import React from 'react';
import './App.css';
import { Container, Typography } from '@mui/material';

const App: React.FC = () => {
  return (
    <Container>
      <Typography variant="h3" component="h1" gutterBottom>
        Pokédex
      </Typography>
      <PokemonTypeChecker />
    </Container>
  );
};

export default App;
