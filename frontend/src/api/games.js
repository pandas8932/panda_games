import api from './axios';

// Get all games
export const getAllGames = async () => {
  try {
    const response = await api.get('/games');
    return response.data;
  } catch (error) {
    console.error('Error fetching all games:', error);
    throw error;
  }
};

// Get games by category
export const getGamesByCategory = async (category) => {
  try {
    const response = await api.get(`/games/category/${category}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching ${category} games:`, error);
    throw error;
  }
};

// Get a specific game by ID
export const getGameById = async (id) => {
  try {
    const response = await api.get(`/games/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching game:', error);
    throw error;
  }
};

// Get user's game history
export const getUserGameHistory = async (page = 1, limit = 10) => {
  try {
    const token = localStorage.getItem('token');
    const response = await api.get(`/games/history/user?page=${page}&limit=${limit}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user game history:', error);
    throw error;
  }
};

// Get game history for a specific game
export const getGameHistory = async (gameId, page = 1, limit = 10) => {
  try {
    const token = localStorage.getItem('token');
    const response = await api.get(`/games/history/game/${gameId}?page=${page}&limit=${limit}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching game history:', error);
    throw error;
  }
};

// Record a game result
export const recordGameResult = async (gameData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await api.post('/games/history', gameData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error recording game result:', error);
    throw error;
  }
};
