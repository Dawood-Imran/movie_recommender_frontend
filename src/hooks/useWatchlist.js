import { useState, useEffect } from 'react';
import { auth, db } from '../firebaseconfig';
import { doc, updateDoc, getDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import toast from 'react-hot-toast';

export const useWatchlist = (movieId) => {
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkIfInWatchlist = async () => {
      if (!auth.currentUser) {
        setIsLoading(false);
        return;
      }

      try {
        const userDocRef = doc(db, 'users', auth.currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const watchlist = userDoc.data().watchlist || [];
          const isInList = watchlist.some(item => item.id === movieId);
          setIsInWatchlist(isInList);
        }
      } catch (error) {
        console.error('Error checking watchlist status:', error);
        toast.error('Error checking watchlist status');
      } finally {
        setIsLoading(false);
      }
    };

    checkIfInWatchlist();

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        checkIfInWatchlist();
      } else {
        setIsInWatchlist(false);
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [movieId]);

  const toggleWatchlist = async (movie) => {
    if (!auth.currentUser) {
      toast.error('Please sign in to manage watchlist');
      return;
    }

    try {
      setIsLoading(true);
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        toast.error('User document not found');
        return;
      }

      await updateDoc(userDocRef, {
        watchlist: isInWatchlist
          ? arrayRemove({
              id: movieId,
              title: movie.title,
              poster_path: movie.poster_path,
              vote_average: movie.vote_average,
              release_date: movie.release_date
            })
          : arrayUnion({
              id: movieId,
              title: movie.title,
              poster_path: movie.poster_path,
              vote_average: movie.vote_average,
              release_date: movie.release_date
            })
      });

      setIsInWatchlist(!isInWatchlist);
      
      toast.success(isInWatchlist ? 'Removed from watchlist' : 'Added to watchlist', {
        duration: 2000,
        icon: isInWatchlist ? '📋' : '🔖',
        style: {
          borderRadius: '10px',
          background: '#22c55e',
          color: '#fff',
        },
      });
    } catch (error) {
      console.error('Error updating watchlist:', error);
      toast.error('Error updating watchlist');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isInWatchlist,
    isLoading,
    toggleWatchlist
  };
};
