import { useState, useEffect } from 'react';
import { auth, db } from '../firebaseconfig';
import { doc, updateDoc, getDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import toast from 'react-hot-toast';

export const useFavorites = (movieId) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkIfFavorite = async () => {
      if (!auth.currentUser) {
        setIsLoading(false);
        return;
      }

      try {
        const userDocRef = doc(db, 'users', auth.currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const favorites = userDoc.data().favorites || [];
          // Check if movie exists in favorites array by comparing movieId
          const isFavorited = favorites.some(favorite => favorite.id === movieId);
          setIsFavorite(isFavorited);
        }
      } catch (error) {
        console.error('Error checking favorite status:', error);
        toast.error('Error checking favorite status');
      } finally {
        setIsLoading(false);
      }
    };

    checkIfFavorite();

    // Set up a listener for auth state changes
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        checkIfFavorite();
      } else {
        setIsFavorite(false);
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [movieId]);

  const toggleFavorite = async (movie) => {
    if (!auth.currentUser) {
      toast.error('Please sign in to add favorites');
      return;
    }

    try {
      setIsLoading(true);
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      
      // Get the current user document
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        toast.error('User document not found');
        return;
      }

      // Update the favorites array
      await updateDoc(userDocRef, {
        favorites: isFavorite 
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

      setIsFavorite(!isFavorite);
      
      toast.success(isFavorite ? 'Removed from favorites' : 'Added to favorites', {
        duration: 2000,
        icon: isFavorite ? '💔' : '❤️',
        style: {
          borderRadius: '10px',
          background: '#22c55e',
          color: '#fff',
        },
      });
    } catch (error) {
      console.error('Error updating favorites:', error);
      toast.error('Error updating favorites');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isFavorite,
    isLoading,
    toggleFavorite
  };
};
