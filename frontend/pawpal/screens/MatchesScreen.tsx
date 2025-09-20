import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore } from '../store/store';
import { Match } from '../types/domain';

interface MatchesScreenProps {
  navigation: any;
}

export default function MatchesScreen() {
  const router = useRouter();
  const { matches, me } = useStore();

  const getMatchRole = (match: Match) => {
    if (me.role === 'owner') return 'owner';
    if (me.role === 'volunteer') return 'volunteer';
    
    if (match.other.role === 'owner') return 'volunteer';
    if (match.other.role === 'volunteer') return 'owner';
    return 'both';
  };

  const getMatchStatus = (match: Match) => {
    switch (match.state) {
      case 'none':
        return { text: 'New Match!', color: '#4A90E2', icon: '💙' };
      case 'proposed':
        return { text: 'Proposal Pending', color: '#FF9800', icon: '⏳' };
      case 'confirmed':
        return { text: 'Meeting Confirmed!', color: '#4CAF50', icon: '✅' };
      default:
        return { text: 'Unknown', color: '#666', icon: '❓' };
    }
  };

  const getMatchDescription = (match: Match) => {
    const myRole = getMatchRole(match);
    if (myRole === 'owner') {
      return `You need a dog walker for your dog`;
    } else if (myRole === 'volunteer') {
      return `You can walk ${match.other.name}'s dog`;
    } else {
      return `Match with ${match.other.name}`;
    }
  };

  const renderMatch = ({ item: match }: { item: Match }) => {
    const matchStatus = getMatchStatus(match);
    const myRole = getMatchRole(match);
    const description = getMatchDescription(match);

    return (
      <TouchableOpacity
        style={styles.matchCard}
        onPress={() => (router as any).push(`/matches/${match.id}`)}
      >
        <View style={styles.matchHeader}>
          <View style={styles.profileInfo}>
            {match.other.photoUrl ? (
              <Image source={{ uri: match.other.photoUrl }} style={styles.profileImage} />
            ) : (
              <View style={[styles.profileImage, styles.placeholderImage]}>
                <Ionicons name="person" size={24} color="#4A90E2" />
              </View>
            )}
            <View style={styles.profileDetails}>
              <Text style={styles.profileName}>{match.other.name}</Text>
              <Text style={styles.profileRole}>
                {match.other.role === 'owner' ? 'Pet Owner' : 
                 match.other.role === 'volunteer' ? 'Volunteer' : 
                 'Pet Owner & Volunteer'}
              </Text>
              <Text style={styles.profileLocation}>
                <Ionicons name="location-outline" size={12} color="#666" /> {match.other.city}
              </Text>
            </View>
          </View>
          
          <View style={styles.statusContainer}>
            <Text style={styles.statusIcon}>{matchStatus.icon}</Text>
            <Text style={[styles.statusText, { color: matchStatus.color }]}>
              {matchStatus.text}
            </Text>
          </View>
        </View>

        <View style={styles.matchContent}>
          <Text style={styles.description}>{description}</Text>
          
          {match.state === 'proposed' && match.proposer === 'them' && (
            <View style={styles.actionRequired}>
              <Ionicons name="time" size={16} color="#FF9800" />
              <Text style={styles.actionText}>Action required: Respond to proposal</Text>
            </View>
          )}
          
          {match.state === 'proposed' && match.proposer === 'me' && (
            <View style={styles.waitingResponse}>
              <Ionicons name="hourglass" size={16} color="#4A90E2" />
              <Text style={styles.waitingText}>Waiting for response</Text>
            </View>
          )}
          
          {match.state === 'confirmed' && (
            <View style={styles.confirmedInfo}>
              <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
              <Text style={styles.confirmedText}>
                Meeting scheduled for {new Date(match.startAt).toLocaleDateString()}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.matchFooter}>
          <View style={styles.roleIndicator}>
            <Ionicons 
              name={myRole === 'owner' ? 'paw' : 'person'} 
              size={16} 
              color="#4A90E2" 
            />
            <Text style={styles.roleText}>
              {myRole === 'owner' ? 'Your Dog' : 'Walking Their Dog'}
            </Text>
          </View>
          
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </View>
      </TouchableOpacity>
    );
  };

  if (matches.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-outline" size={80} color="#ccc" />
          <Text style={styles.emptyTitle}>No Matches Yet</Text>
          <Text style={styles.emptyMessage}>
            Keep swiping to find your perfect match!
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Matches</Text>
        <Text style={styles.headerSubtitle}>{matches.length} match{matches.length !== 1 ? 'es' : ''}</Text>
      </View>
      
      <FlatList
        data={matches}
        renderItem={renderMatch}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  listContainer: {
    padding: 16,
  },
  matchCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  profileInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  placeholderImage: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileDetails: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 2,
  },
  profileRole: {
    fontSize: 14,
    color: '#4A90E2',
    fontWeight: '500',
    marginBottom: 2,
  },
  profileLocation: {
    fontSize: 12,
    color: '#666',
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  matchContent: {
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  actionRequired: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  actionText: {
    fontSize: 12,
    color: '#FF9800',
    marginLeft: 4,
    fontWeight: '500',
  },
  waitingResponse: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  waitingText: {
    fontSize: 12,
    color: '#4A90E2',
    marginLeft: 4,
    fontWeight: '500',
  },
  confirmedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  confirmedText: {
    fontSize: 12,
    color: '#4CAF50',
    marginLeft: 4,
    fontWeight: '500',
  },
  matchFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  roleIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleText: {
    fontSize: 12,
    color: '#4A90E2',
    marginLeft: 4,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
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
    lineHeight: 24,
  },
});
