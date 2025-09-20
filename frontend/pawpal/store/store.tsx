// store/store.tsx
import React, { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import mockData from '../data/mockData.json';
import { Match, Profile } from '../types/domain';

const generateId = () => Math.random().toString(36).substr(2, 9);

type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'volunteer' | 'both';
  city?: string;
  photoUrl?: string;
  prompt1?: string;
  prompt2?: string;
  largeOk?: boolean;
  reactiveOk?: boolean;
};

type Store = {
  // Authentication
  isAuthenticated: boolean;
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string, role: 'owner' | 'volunteer' | 'both') => Promise<boolean>;
  logout: () => void;
  
  // App data
  me: Profile;
  setMe: (p: Profile) => void;
  feed: Profile[];
  like: (id: string) => Match | null;
  pass: (id: string) => void;
  matches: Match[];
  updateMatch: (m: Match) => void;
  likes: Record<string, string[]>; // Add this line
};

const Ctx = createContext<Store | undefined>(undefined);

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  
  // App state - using mock data
  const [me, setMe] = useState<Profile>({ 
    id: 'me', 
    name: 'You', 
    email: 'you@example.com',
    role: 'both', 
    city: 'Dublin' 
  });
  const [profiles] = useState<Profile[]>(mockData.profiles as Profile[]);
  const [swiped, setSwiped] = useState<Record<string, 'left' | 'right'>>({});
  const [matches, setMatches] = useState<Match[]>([]);

  // Add this new state to track who liked whom
  const [likes, setLikes] = useState<Record<string, string[]>>({});

  // Authentication methods
  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check against mock data
    const user = profiles.find(p => p.email === email && p.password === password);
    
    if (user) {
      const authUser: AuthUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        city: user.city,
        photoUrl: user.photoUrl,
        prompt1: user.prompt1,
        prompt2: user.prompt2,
        largeOk: user.largeOk,
        reactiveOk: user.reactiveOk
      };
      setUser(authUser);
      setMe({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        city: user.city,
        photoUrl: user.photoUrl,
        prompt1: user.prompt1,
        prompt2: user.prompt2,
        largeOk: user.largeOk,
        reactiveOk: user.reactiveOk
      });
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const signup = async (name: string, email: string, password: string, role: 'owner' | 'volunteer' | 'both'): Promise<boolean> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if user already exists
    const existingUser = profiles.find(p => p.email === email);
    if (existingUser) {
      // Assuming Alert is available globally or imported elsewhere
      // @ts-ignore // Assuming Alert is not defined in this file, but it's in the new_code
      Alert.alert('Error', 'User with this email already exists');
      return false;
    }
    
    // Create new user
    const newUser: AuthUser = {
      id: generateId(),
      name,
      email,
      role,
      city: 'Dublin' // Default city, could be made configurable
    };
    
    setUser(newUser);
    setMe({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      city: newUser.city,
      photoUrl: newUser.photoUrl,
      prompt1: newUser.prompt1,
      prompt2: newUser.prompt2,
      largeOk: newUser.largeOk,
      reactiveOk: newUser.reactiveOk
    });
    setIsAuthenticated(true);
    return true;
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setMe({ 
      id: 'me', 
      name: 'You', 
      email: 'you@example.com',
      role: 'both', 
      city: 'Dublin' 
    });
    setSwiped({});
    setMatches([]);
    setLikes({}); // Clear likes on logout
  };

  const feed = useMemo(
    () =>
      profiles.filter(
        (p) =>
          p.id !== me.id &&
          (me.role === 'both' ? true : me.role === 'owner' ? p.role !== 'owner' : p.role !== 'volunteer') &&
          !swiped[p.id],
      ),
    [profiles, swiped, me.role, me.id],
  );

  const like = (id: string): Match | null => {
    setSwiped((s) => ({ ...s, [id]: 'right' }));
    
    // Add the liked user to our likes list
    setLikes((prev) => ({
      ...prev,
      [me.id]: [...(prev[me.id] || []), id]
    }));
    
    // Check if the other user has also liked us (from mock data)
    const otherProfile = profiles.find((p) => p.id === id);
    const otherUserLikes = otherProfile?.likedUserIds || [];
    const mutualLike = otherUserLikes.includes(me.id);
    
    // Debug logging
    console.log('Like function called:');
    console.log('Current user ID:', me.id);
    console.log('Liking user ID:', id);
    console.log('Other user likedUserIds:', otherUserLikes);
    console.log('Mutual like:', mutualLike);
    
    if (!mutualLike) {
      // No mutual like yet
      return null;
    }
    
    // Mutual like! Create a match
    const m: Match = { 
      id: generateId(), 
      other: otherProfile!, 
      state: 'none'
    };
    setMatches((prev) => [m, ...prev]);
    return m;
  };

  const pass = (id: string) => setSwiped((s) => ({ ...s, [id]: 'left' }));

  const updateMatch = (m: Match) => setMatches((prev) => prev.map((x) => (x.id === m.id ? m : x)));

  // Add this function to check for delayed matches (when someone likes us back)
  const checkForDelayedMatches = () => {
    const myLikes = likes[me.id] || [];
    const myMatches = matches.map(m => m.other.id);
    
    myLikes.forEach(likedUserId => {
      // Check if they liked us back (from mock data)
      const otherProfile = profiles.find((p) => p.id === likedUserId);
      const otherUserLikes = otherProfile?.likedUserIds || [];
      const mutualLike = otherUserLikes.includes(me.id);
      
      // If we liked them and they liked us back, but we don't have a match yet
      if (mutualLike && !myMatches.includes(likedUserId)) {
        const m: Match = { 
          id: generateId(), 
          other: otherProfile!, 
          state: 'none'
        };
        setMatches((prev) => [m, ...prev]);
      }
    });
  };

  // Call this function whenever likes are updated
  useEffect(() => {
    checkForDelayedMatches();
  }, [likes]);

  const value: Store = { 
    isAuthenticated, 
    user, 
    login, 
    signup, 
    logout,
    me, 
    setMe, 
    feed, 
    like, 
    pass, 
    matches, 
    updateMatch,
    likes // Add this line
  };
  
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export const useStore = (): Store => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
};
