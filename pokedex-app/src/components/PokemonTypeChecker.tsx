import React, { useState, useEffect } from 'react';
import axios from 'axios';
import stringSimilarity from 'string-similarity';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Container,
  Card,
  CardContent,
  CardMedia,
  Grid,
} from '@mui/material';

// Type sprite mapping (Uses Pokémon Showdown type icons)
const typeIcons: Record<string, string> = {
  normal: "https://play.pokemonshowdown.com/sprites/types/Normal.png",
  fire: "https://play.pokemonshowdown.com/sprites/types/Fire.png",
  water: "https://play.pokemonshowdown.com/sprites/types/Water.png",
  electric: "https://play.pokemonshowdown.com/sprites/types/Electric.png",
  grass: "https://play.pokemonshowdown.com/sprites/types/Grass.png",
  ice: "https://play.pokemonshowdown.com/sprites/types/Ice.png",
  fighting: "https://play.pokemonshowdown.com/sprites/types/Fighting.png",
  poison: "https://play.pokemonshowdown.com/sprites/types/Poison.png",
  ground: "https://play.pokemonshowdown.com/sprites/types/Ground.png",
  flying: "https://play.pokemonshowdown.com/sprites/types/Flying.png",
  psychic: "https://play.pokemonshowdown.com/sprites/types/Psychic.png",
  bug: "https://play.pokemonshowdown.com/sprites/types/Bug.png",
  rock: "https://play.pokemonshowdown.com/sprites/types/Rock.png",
  ghost: "https://play.pokemonshowdown.com/sprites/types/Ghost.png",
  dragon: "https://play.pokemonshowdown.com/sprites/types/Dragon.png",
  dark: "https://play.pokemonshowdown.com/sprites/types/Dark.png",
  steel: "https://play.pokemonshowdown.com/sprites/types/Steel.png",
  fairy: "https://play.pokemonshowdown.com/sprites/types/Fairy.png",
};

interface PokemonType {
  name: string;
}

const PokemonTypeChecker: React.FC = () => {
  const [pokemonName, setPokemonName] = useState<string>('');
  const [effectiveTypes, setEffectiveTypes] = useState<string[]>([]);
  const [pokemonImage, setPokemonImage] = useState<string>('');
  const [flavorText, setFlavorText] = useState<string>('');
  const [height, setHeight] = useState<number>(0);
  const [weight, setWeight] = useState<number>(0);
  const [abilities, setAbilities] = useState<string[]>([]);
  const [baseExperience, setBaseExperience] = useState<number>(0);
  const [evolutions, setEvolutions] = useState<{ name: string; image: string }[]>([]);
  const [suggestedName, setSuggestedName] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPokemonName(e.target.value);
  };

  const handleSearch = async (name?: string) => {
    const searchName = name || pokemonName;
    setError('');
    if (!searchName.trim()) {
      setError('Please enter a Pokémon name.');
      return;
    }
    try {
      const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${searchName.toLowerCase()}`);
      const speciesResponse = await axios.get(response.data.species.url);

      // Get the first available flavor text
      const flavorEntry = speciesResponse.data.flavor_text_entries.find((entry: any) => entry.language.name === 'en');
      setFlavorText(flavorEntry ? flavorEntry.flavor_text : 'No description available.');

      // Fetch evolutions
      const evolutionChainUrl = speciesResponse.data.evolution_chain.url;
      const evolutionResponse = await axios.get(evolutionChainUrl);
      const evolutionData = extractEvolutions(evolutionResponse.data.chain);

      setPokemonImage(response.data.sprites.front_default);
      setHeight(response.data.height / 10); // Convert to meters
      setWeight(response.data.weight / 10); // Convert to kilograms
      setAbilities(response.data.abilities.map((a: any) => a.ability.name));
      setBaseExperience(response.data.base_experience);
      setEvolutions(evolutionData);

      const types: string[] = response.data.types.map((type: { type: PokemonType }) => type.type.name);
      const weaknesses = await getWeaknesses(types);
      setEffectiveTypes(weaknesses);
      setSuggestedName('');
    } catch (error) {
      const suggestion = await getClosestPokemonName(searchName);
      setSuggestedName(suggestion);
      setEffectiveTypes([]);
      setPokemonImage('');
      setError(`Pokémon "${searchName}" not found.`);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const getWeaknesses = async (types: string[]): Promise<string[]> => {
    const weaknesses = new Set<string>();
    for (const type of types) {
      const response = await axios.get(`https://pokeapi.co/api/v2/type/${type}`);
      response.data.damage_relations.double_damage_from.forEach(
        (weakness: PokemonType) => weaknesses.add(weakness.name)
      );
    }
    return Array.from(weaknesses);
  };

  const getClosestPokemonName = async (inputName: string): Promise<string> => {
    const response = await axios.get('https://pokeapi.co/api/v2/pokemon?limit=1000');
    const pokemonNames: string[] = response.data.results.map((pokemon: { name: string }) => pokemon.name);
    const { bestMatch } = stringSimilarity.findBestMatch(inputName.toLowerCase(), pokemonNames);
    return bestMatch.target;
  };

  const extractEvolutions = (chain: any): { name: string; image: string }[] => {
    const evolutions: { name: string; image: string }[] = [];
    let current = chain;
    while (current) {
      evolutions.push({
        name: current.species.name,
        image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${current.species.url.split('/')[6]}.png`,
      });
      current = current.evolves_to.length ? current.evolves_to[0] : null;
    }
    return evolutions;
  };

  const handleEvolutionClick = async (name: string) => {
    setPokemonName(name);
    await handleSearch(name);
  };

  const handleSuggestedNameClick = () => {
    setPokemonName(suggestedName);
    handleSearch(suggestedName);
  };

  return (
    <Container maxWidth="md" sx={{ backgroundColor: 'red', borderRadius: 2 }}>
      <Box p={5} sx={{ borderRadius: 2 }}>
        <TextField
          fullWidth
          value={pokemonName}
          onChange={handleInputChange}
          onKeyDown={handleKeyPress}
          placeholder="Enter Pokémon name"
          margin="normal"
          InputProps={{
            style: { color: 'black', backgroundColor: 'gold', borderRadius: 2 }, // Set the text color to black and background to gold
          }}
        />
        <Button fullWidth variant="contained" color="primary" onClick={() => handleSearch()}>Check Pokémon</Button>
        
        {error && <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>{error}</Alert>}

        {pokemonImage && (
          <Card sx={{ mt: 2, borderRadius: 2 }}>
            <CardMedia component="img" image={pokemonImage} alt={pokemonName} sx={{ height: 150, objectFit: 'contain', borderRadius: 2 }} />
            <CardContent>
              <Typography variant="h5"><strong>{pokemonName.toUpperCase()}</strong> </Typography>
              <Typography variant="body2">{flavorText}</Typography>
              <Typography><strong>Height:</strong> {height}m | <strong>Weight:</strong> {weight}kg</Typography>
              <Typography><strong>Base Experience:</strong> {baseExperience}</Typography>
              <Typography><strong>Abilities:</strong> {abilities.join(', ')}</Typography>
            </CardContent>
          </Card>
        )}
        <Container maxWidth="md" sx={{ backgroundColor: 'gray', borderRadius: 2 }}>
          {effectiveTypes.length > 0 && (
            <Box textAlign="center" mt={2}>
              <Typography variant="h6">
                Types super effective against {pokemonName}:
              </Typography>
              <List>
                {effectiveTypes.map((type) => (
                  <ListItem key={type}>
                    <ListItemIcon>
                      <img
                        src={typeIcons[type] || ''}
                        alt={type}
                        style={{ width: 32, height: 32 }}
                      />
                    </ListItemIcon>
                    <ListItemText primary={type.charAt(0).toUpperCase() + type.slice(1)} />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {evolutions.length > 1 && <Typography variant="h6" sx={{ mt: 2 }}>Evolutions:</Typography>}
          <Grid container spacing={2}>
            {evolutions.map((evo) => (
              <Grid item key={evo.name}>
                <CardMedia
                  component="img"
                  image={evo.image}
                  alt={evo.name}
                  sx={{ width: 100, height: 100, cursor: 'pointer', borderRadius: 2 }}
                  onClick={() => handleEvolutionClick(evo.name)}
                />
                <Typography align="center">{evo.name.toUpperCase()}</Typography>
              </Grid>
            ))}
          </Grid>
        </Container>
        {suggestedName && (
          <Box textAlign="center" mt={2}>
            <Typography>Did you mean "{suggestedName}"?</Typography>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleSuggestedNameClick}
              sx={{ mt: 1, borderRadius: 2 }}
            >
              Yes
            </Button>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default PokemonTypeChecker;
