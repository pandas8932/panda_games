import React, { useState, useEffect } from 'react';
import { getUserGameHistory } from '../../api/games';
import './GameHistory.css';

const GameHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    fetchHistory();
  }, [currentPage]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await getUserGameHistory(currentPage, 10);
      setHistory(response.history);
      setTotalPages(response.pagination.totalPages);
      setTotalItems(response.pagination.totalItems);
    } catch (err) {
      setError('Failed to load game history');
      console.error('Error fetching game history:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const getResultColor = (result) => {
    switch (result) {
      case 'win':
        return '#4CAF50';
      case 'loss':
        return '#f44336';
      case 'draw':
        return '#FF9800';
      default:
        return '#fff';
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Loading game history...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>{error}</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Game History</h1>
        <p style={styles.subtitle}>Your gaming journey at a glance</p>
      </div>

      {history.length === 0 ? (
        <div style={styles.empty}>
          <h3>No games played yet</h3>
          <p>Start playing games to see your history here!</p>
        </div>
      ) : (
        <>
          <div style={styles.stats}>
            <div style={styles.statCard}>
              <h3>Total Games</h3>
              <p>{totalItems}</p>
            </div>
            <div style={styles.statCard}>
              <h3>Wins</h3>
              <p style={{ color: '#4CAF50' }}>
                {history.filter(game => game.result === 'win').length}
              </p>
            </div>
            <div style={styles.statCard}>
              <h3>Losses</h3>
              <p style={{ color: '#f44336' }}>
                {history.filter(game => game.result === 'loss').length}
              </p>
            </div>
          </div>

          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeader}>
                  <th>Game</th>
                  <th>Bet Amount</th>
                  <th>Result</th>
                  <th>Coins Won/Lost</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {history.map((game, index) => (
                  <tr key={game._id || index} style={styles.tableRow}>
                    <td style={styles.gameCell}>
                      <div style={styles.gameInfo}>
                        <img 
                          src={game.gameId?.image || '/default-game.png'} 
                          alt={game.gameName}
                          style={styles.gameImage}
                        />
                        <span>{game.gameName}</span>
                      </div>
                    </td>
                    <td style={styles.cell}>{game.betAmount.toFixed(2)}</td>
                    <td style={styles.cell}>
                      <span style={{
                        ...styles.resultBadge,
                        backgroundColor: getResultColor(game.result)
                      }}>
                        {game.result.toUpperCase()}
                      </span>
                    </td>
                    <td style={styles.cell}>
                      <span style={{
                        color: game.coinsWon > 0 ? '#4CAF50' : game.coinsLost > 0 ? '#f44336' : '#fff'
                      }}>
                        {game.coinsWon > 0 ? `+${game.coinsWon.toFixed(2)}` : 
                         game.coinsLost > 0 ? `-${game.coinsLost.toFixed(2)}` : '0.00'}
                      </span>
                    </td>
                    <td style={styles.cell}>{formatDate(game.playedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div style={styles.pagination}>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                style={styles.paginationButton}
              >
                Previous
              </button>
              
              <span style={styles.pageInfo}>
                Page {currentPage} of {totalPages}
              </span>
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                style={styles.paginationButton}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    padding: '20px',
    backgroundColor: 'transparent',
    color: 'white',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px'
  },
  title: {
    fontSize: '2.5rem',
    marginBottom: '10px',
    color: '#FFD700'
  },
  subtitle: {
    fontSize: '1.1rem',
    color: '#ccc',
    margin: 0
  },
  loading: {
    textAlign: 'center',
    fontSize: '18px',
    padding: '40px'
  },
  error: {
    textAlign: 'center',
    color: '#ff6b6b',
    fontSize: '16px',
    padding: '40px'
  },
  empty: {
    textAlign: 'center',
    padding: '60px 20px'
  },
  stats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '30px'
  },
  statCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: '20px',
    borderRadius: '10px',
    textAlign: 'center',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.2)'
  },
  tableContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '10px',
    overflow: 'hidden',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    marginBottom: '20px'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  tableHeader: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)'
  },
  tableRow: {
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
  },
  tableRow: {
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.05)'
    }
  },
  cell: {
    padding: '15px',
    textAlign: 'center'
  },
  gameCell: {
    padding: '15px',
    textAlign: 'left'
  },
  gameInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  gameImage: {
    width: '40px',
    height: '40px',
    borderRadius: '5px',
    objectFit: 'cover'
  },
  resultBadge: {
    padding: '5px 10px',
    borderRadius: '15px',
    fontSize: '12px',
    fontWeight: 'bold',
    textTransform: 'uppercase'
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '20px',
    marginTop: '20px'
  },
  paginationButton: {
    padding: '10px 20px',
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    border: '1px solid rgba(255, 215, 0, 0.3)',
    borderRadius: '5px',
    color: 'white',
    cursor: 'pointer',
    fontSize: '14px',
    '&:disabled': {
      opacity: 0.5,
      cursor: 'not-allowed'
    },
    '&:hover:not(:disabled)': {
      backgroundColor: 'rgba(255, 215, 0, 0.3)'
    }
  },
  pageInfo: {
    fontSize: '14px',
    color: '#ccc'
  }
};

export default GameHistory;
