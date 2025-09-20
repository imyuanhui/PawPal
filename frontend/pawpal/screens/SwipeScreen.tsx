import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Swiper from 'react-native-deck-swiper';
import ProfileCard from '../components/ProfileCard';
import { useStore } from '../store/store';

type SwipeMode = 'owners' | 'volunteers';

export default function SwipeScreen() {
  const router = useRouter();
  const { feed, like, pass, me } = useStore();
  const [matchId, setMatchId] = useState<string | null>(null);
  const [show, setShow] = useState(false);
  const [swipeMode, setSwipeMode] = useState<SwipeMode>('volunteers');
  const [showModeSelector, setShowModeSelector] = useState(false);
  const [allSwiped, setAllSwiped] = useState(false);

  // Filter profiles based on current user's role and selected mode
  const getFilteredFeed = () => {
    if (me.role === 'owner') {
      // Owners want to find volunteers (dog sitters)
      return feed.filter(profile => profile.role === 'volunteer' || profile.role === 'both');
    } else if (me.role === 'volunteer') {
      // Volunteers want to find owners (dogs to walk)
      return feed.filter(profile => profile.role === 'owner' || profile.role === 'both');
    } else {
      // Both role - filter based on selected mode
      if (swipeMode === 'volunteers') {
        // Finding dog sitters = show volunteers
        return feed.filter(profile => profile.role === 'volunteer' || profile.role === 'both');
      } else {
        // Finding dogs to walk = show owners
        return feed.filter(profile => profile.role === 'owner' || profile.role === 'both');
      }
    }
  };

  const filteredFeed = getFilteredFeed();

  const handleModeSelect = (mode: SwipeMode) => {
    setSwipeMode(mode);
    setShowModeSelector(false);
    setAllSwiped(false); // Reset the all swiped state when switching modes
  };

  const getModeTitle = () => {
    if (me.role === 'owner') return 'Find Dog Sitters';
    if (me.role === 'volunteer') return 'Find Dogs to Walk';
    return swipeMode === 'volunteers' ? 'Find Dog Sitters' : 'Find Dogs to Walk';
  };

  const getModeIcon = () => {
    if (me.role === 'owner') return 'person-outline';
    if (me.role === 'volunteer') return 'paw-outline';
    return swipeMode === 'volunteers' ? 'person-outline' : 'paw-outline';
  };

  const getEmptyMessage = () => {
    if (me.role === 'owner') return 'No dog sitters available right now';
    if (me.role === 'volunteer') return 'No dogs available right now';
    return swipeMode === 'volunteers' ? 'No dog sitters available right now' : 'No dogs available right now';
  };

  const getCurrentModeLabel = () => {
    if (me.role === 'owner') return 'DOG SITTERS';
    if (me.role === 'volunteer') return 'DOGS TO WALK';
    return swipeMode === 'volunteers' ? 'DOG SITTERS' : 'DOGS TO WALK';
  };

  const getNoMoreMessage = () => {
    if (me.role === 'owner') return 'No more dog sitters!';
    if (me.role === 'volunteer') return 'No more dogs to walk!';
    return swipeMode === 'volunteers' ? 'No more dog sitters!' : 'No more dogs to walk!';
  };

  const getNoMoreSubMessage = () => {
    if (me.role === 'owner') return 'You\'ve seen all available dog sitters. Check back later for new volunteers!';
    if (me.role === 'volunteer') return 'You\'ve seen all available dogs. Check back later for new owners!';
    return swipeMode === 'volunteers' 
      ? 'You\'ve seen all available dog sitters. Try switching modes or check back later!'
      : 'You\'ve seen all available dogs. Try switching modes or check back later!';
  };

  const handleSwipedAll = () => {
    setAllSwiped(true);
    Alert.alert(
      getNoMoreMessage(),
      getNoMoreSubMessage(),
      [
        { text: 'OK' },
        ...(me.role === 'both' ? [{ text: 'Switch Mode', onPress: () => setShowModeSelector(true) }] : [])
      ]
    );
  };

  const resetSwipes = () => {
    setAllSwiped(false);
    // In a real app, you might want to reset the swiped state or fetch new profiles
  };

  return (
    <View style={styles.container}>
      {/* Mode Indicator - FIXED POSITIONING */}
      <View style={styles.modeIndicatorContainer}>
        <View style={styles.modeIndicator}>
          <Ionicons name={getModeIcon()} size={24} color="#4A90E2" />
          <Text style={styles.modeLabel}>{getCurrentModeLabel()}</Text>
          {me.role === 'both' && (
            <TouchableOpacity 
              style={styles.modeSwitchButton}
              onPress={() => setShowModeSelector(true)}
            >
              <Ionicons name="swap-horizontal" size={20} color="#4A90E2" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {filteredFeed.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name={getModeIcon()} size={80} color="#ccc" />
          <Text style={styles.emptyTitle}>{getModeTitle()}</Text>
          <Text style={styles.emptyMessage}>{getEmptyMessage()}</Text>
          {me.role === 'both' && (
            <TouchableOpacity 
              style={styles.switchModeButton} 
              onPress={() => setShowModeSelector(true)}
            >
              <Text style={styles.switchModeText}>Switch Mode</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : allSwiped ? (
        <View style={styles.noMoreContainer}>
          <Ionicons name={getModeIcon()} size={80} color="#4A90E2" />
          <Text style={styles.noMoreTitle}>{getNoMoreMessage()}</Text>
          <Text style={styles.noMoreSubMessage}>{getNoMoreSubMessage()}</Text>
          
          <View style={styles.noMoreActions}>
            {me.role === 'both' && (
              <TouchableOpacity 
                style={styles.switchModeButton} 
                onPress={() => setShowModeSelector(true)}
              >
                <Text style={styles.switchModeText}>Switch Mode</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={styles.refreshButton} 
              onPress={resetSwipes}
            >
              <Ionicons name="refresh" size={20} color="#4A90E2" />
              <Text style={styles.refreshButtonText}>Refresh</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <>
          <Swiper
            cards={filteredFeed}
            renderCard={(p: any) => p ? <ProfileCard profile={p} /> : null}
            onSwipedRight={(i) => {
              const p = filteredFeed[i]; 
              if (!p) return;
              const m = like(p.id);
              if (m) { setMatchId(m.id); setShow(true); }
            }}
            onSwipedLeft={(i) => { 
              const p = filteredFeed[i]; 
              if (p) pass(p.id); 
            }}
            backgroundColor="#fff"
            stackSize={3}
            animateCardOpacity
            cardIndex={0}
            onSwipedAll={handleSwipedAll}
          />

          {/* Bottom Like/Pass buttons */}
          <View style={styles.actions}>
            <TouchableOpacity style={[styles.btn, { backgroundColor:'#E5E7EB'}]} onPress={()=>{}}>
              <Text>✖</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, { backgroundColor:'#2E7D32'}]} onPress={()=>{}}>
              <Text style={{ color:'#fff', fontWeight:'600' }}>♥ Like</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, { backgroundColor:'#E5E7EB'}]} onPress={()=>{}}>
              <Text>ℹ︎</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* Mode Selector Modal */}
      <Modal visible={showModeSelector} transparent animationType="fade" onRequestClose={()=>setShowModeSelector(false)}>
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Choose Swipe Mode</Text>
            <Text style={styles.modalSubtitle}>What would you like to find?</Text>
            
            <TouchableOpacity 
              style={[styles.modeOption, swipeMode === 'volunteers' && styles.modeOptionSelected]} 
              onPress={() => handleModeSelect('volunteers')}
            >
              <Ionicons name="person-outline" size={24} color={swipeMode === 'volunteers' ? '#4A90E2' : '#666'} />
              <View style={styles.modeOptionText}>
                <Text style={[styles.modeOptionTitle, swipeMode === 'volunteers' && styles.modeOptionTitleSelected]}>
                  Find Dog Sitters
                </Text>
                <Text style={styles.modeOptionDescription}>
                  Look for volunteers to walk your dog
                </Text>
              </View>
              {swipeMode === 'volunteers' && (
                <Ionicons name="checkmark-circle" size={24} color="#4A90E2" />
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.modeOption, swipeMode === 'owners' && styles.modeOptionSelected]} 
              onPress={() => handleModeSelect('owners')}
            >
              <Ionicons name="paw-outline" size={24} color={swipeMode === 'owners' ? '#4A90E2' : '#666'} />
              <View style={styles.modeOptionText}>
                <Text style={[styles.modeOptionTitle, swipeMode === 'owners' && styles.modeOptionTitleSelected]}>
                  Find Dogs to Walk
                </Text>
                <Text style={styles.modeOptionDescription}>
                  Look for dogs that need walking
                </Text>
              </View>
              {swipeMode === 'owners' && (
                <Ionicons name="checkmark-circle" size={24} color="#4A90E2" />
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.confirmButton} 
              onPress={() => setShowModeSelector(false)}
            >
              <Text style={styles.confirmButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Match modal */}
      <Modal visible={show} transparent animationType="fade" onRequestClose={()=>setShow(false)}>
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <Text style={{ fontSize:22, fontWeight:'700', marginBottom:8 }}>It's a match!</Text>
            <Text style={{ color:'#6B7280', marginBottom:16 }}>You both liked each other.</Text>
            <TouchableOpacity style={[styles.cta]} onPress={() => { setShow(false); router.push(`/match/${matchId}`); }}>
              <Text style={{ color:'#fff', fontWeight:'600' }}>Set time & place</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={()=>setShow(false)}><Text style={{ marginTop:12 }}>Keep swiping</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f8f9fa',
  },
  modeIndicatorContainer: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    zIndex: 1000,
    elevation: 10,
  },
  modeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4A90E2',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2E5BBA',
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 4,
  },
  modeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 6,
    letterSpacing: 0.3,
  },
  modeSwitchButton: {
    marginLeft: 6,
    padding: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    marginTop: 100,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  noMoreContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    marginTop: 100,
  },
  noMoreTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4A90E2',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  noMoreSubMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  noMoreActions: {
    flexDirection: 'row',
    gap: 16,
  },
  switchModeButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  switchModeText: {
    color: 'white',
    fontWeight: '600',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#4A90E2',
  },
  refreshButtonText: {
    color: '#4A90E2',
    fontWeight: '600',
    marginLeft: 8,
  },
  actions: { 
    position: 'absolute', 
    bottom: 24, 
    left: 0, 
    right: 0, 
    flexDirection: 'row', 
    justifyContent: 'space-evenly' 
  },
  btn: { 
    paddingHorizontal: 18, 
    paddingVertical: 12, 
    borderRadius: 24 
  },
  overlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.3)', 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  modalCard: { 
    width: '85%', 
    backgroundColor: '#fff', 
    borderRadius: 16, 
    padding: 24, 
    alignItems: 'center' 
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  modeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e1e8ed',
    backgroundColor: '#f8f9fa',
    marginBottom: 12,
    width: '100%',
  },
  modeOptionSelected: {
    borderColor: '#4A90E2',
    backgroundColor: '#f0f7ff',
  },
  modeOptionText: {
    flex: 1,
    marginLeft: 12,
  },
  modeOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  modeOptionTitleSelected: {
    color: '#4A90E2',
  },
  modeOptionDescription: {
    fontSize: 14,
    color: '#666',
  },
  confirmButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 8,
    width: '100%',
    alignItems: 'center',
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  cta: { 
    backgroundColor: '#2E7D32', 
    paddingVertical: 12, 
    paddingHorizontal: 18, 
    borderRadius: 12, 
    width: '100%', 
    alignItems: 'center' 
  },
});
