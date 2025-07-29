import { useState, useEffect } from 'react';
import { auth, db } from '../firebaseconfig';
import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';

export const useRating = (movieId) => {
  const [userRating, setUserRating] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserRating = async () => {
      if (!auth.currentUser) {
        setIsLoading(false);
        return;
      }

      try {
        const userDocRef = doc(db, 'users', auth.currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const ratings = userDoc.data().ratings || {};
          setUserRating(ratings[movieId] || 0);
        }
      } catch (error) {
        console.error('Error fetching rating:', error);
        toast.error('Error fetching rating');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserRating();

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchUserRating();
      } else {
        setUserRating(0);
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [movieId]);

  const setRating = async (rating) => {
    if (!auth.currentUser) {
      toast.error('Please sign in to rate movies');
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

      const currentRatings = userDoc.data().ratings || {};
      
      await updateDoc(userDocRef, {
        ratings: {
          ...currentRatings,
          [movieId]: rating
        }
      });

      setUserRating(rating);
      
      toast.success('Rating updated!', {
        duration: 2000,
        icon: '⭐',
        style: {
          borderRadius: '10px',
          background: '#22c55e',
          color: '#fff',
        },
      });
    } catch (error) {
      console.error('Error updating rating:', error);
      toast.error('Error updating rating');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    userRating,
    isLoading,
    setRating
  };
};
