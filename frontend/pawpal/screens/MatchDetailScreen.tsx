import DateTimePicker from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { useStore } from '../store/store';
import { Match } from '../types/domain';

export default function MatchDetailScreen({ route }: any) {
  const { matchId } = route.params;
  const { matches, updateMatch, me } = useStore();
  const m = matches.find(x => x.id === matchId) as Match | undefined;

  const [date, setDate] = useState<Date>(new Date(Date.now() + 60*60*1000));
  const [duration, setDuration] = useState<number>(30);
  const [place, setPlace] = useState<string>('St. Anne\'s Park Gate');

  if (!m) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Match not found.</Text>
      </View>
    );
  }

  const getMatchRole = () => {
    if (me.role === 'owner') return 'owner';
    if (me.role === 'volunteer') return 'volunteer';
    
    if (m.other.role === 'owner') return 'volunteer';
    if (m.other.role === 'volunteer') return 'owner';
    return 'both';
  };

  const myRole = getMatchRole();

  const propose = () => {
    updateMatch({ 
      id: m.id, 
      other: m.other, 
      state: 'proposed', 
      startAt: date.getTime(), 
      place, 
      duration, 
      proposer: 'me'
    });
    Alert.alert('Proposal Sent', 'Your meeting proposal has been sent!');
  };
  
  const accept = () => {
    updateMatch({ 
      id: m.id, 
      other: m.other, 
      state: 'confirmed', 
      startAt: m.startAt, 
      place: m.place, 
      duration: m.duration
    });
    Alert.alert('Meeting Confirmed!', 'You have confirmed the meeting.');
  };

  const decline = () => {
    Alert.alert(
      'Decline Proposal',
      'Are you sure you want to decline this proposal?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Decline', 
          style: 'destructive', 
          onPress: () => {
            updateMatch({ 
              id: m.id, 
              other: m.other, 
              state: 'none'
            });
            Alert.alert('Proposal Declined', 'The proposal has been declined.');
          }
        }
      ]
    );
  };

  const getMatchStatus = () => {
    switch (m.state) {
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

  const getRoleDescription = () => {
    if (myRole === 'owner') {
      return 'You are looking for someone to walk your dog';
    } else if (myRole === 'volunteer') {
      return `You can walk ${m.other.name}'s dog`;
    } else {
      return `Match with ${m.other.name}`;
    }
  };

  const matchStatus = getMatchStatus();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.name}>{m.other.name}</Text>
        <Text style={styles.subtitle}>{m.other.city} · {m.other.role}</Text>
        
        <View style={styles.roleDescription}>
          <Text style={styles.roleText}>{getRoleDescription()}</Text>
        </View>
        
        <View style={styles.statusContainer}>
          <Text style={styles.statusIcon}>{matchStatus.icon}</Text>
          <Text style={[styles.statusText, { color: matchStatus.color }]}>
            {matchStatus.text}
          </Text>
        </View>
      </View>

      {m.other.prompt1 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About {m.other.name}</Text>
          <Text style={styles.promptText}>"{m.other.prompt1}"</Text>
        </View>
      )}

      {m.other.prompt2 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Experience</Text>
          <Text style={styles.promptText}>"{m.other.prompt2}"</Text>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        
        <View style={styles.preferenceRow}>
          <Text style={styles.preferenceLabel}>Large dogs OK</Text>
          <Text style={[styles.preferenceValue, { color: m.other.largeOk ? '#4CAF50' : '#F44336' }]}>
            {m.other.largeOk ? 'Yes' : 'No'}
          </Text>
        </View>
        
        <View style={styles.preferenceRow}>
          <Text style={styles.preferenceLabel}>Reactive dogs OK</Text>
          <Text style={[styles.preferenceValue, { color: m.other.reactiveOk ? '#4CAF50' : '#F44336' }]}>
            {m.other.reactiveOk ? 'Yes' : 'No'}
          </Text>
        </View>
      </View>

      {m.state !== 'confirmed' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Schedule Meeting</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Date & Time</Text>
            <DateTimePicker 
              value={date} 
              onChange={(_, d) => d && setDate(d)} 
              mode="datetime" 
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Duration (minutes)</Text>
            <TextInput 
              value={String(duration)} 
              onChangeText={(t) => setDuration(Number(t) || 30)} 
              keyboardType="number-pad"
              style={styles.input} 
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Meeting Place</Text>
            <TextInput 
              value={place} 
              onChangeText={setPlace} 
              placeholder="Enter meeting location"
              style={styles.input} 
            />
          </View>
        </View>
      )}

      {m.state === 'confirmed' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Meeting Details</Text>
          <Text style={styles.meetingDetail}>
            📅 {new Date(m.startAt).toLocaleDateString()} at {new Date(m.startAt).toLocaleTimeString()}
          </Text>
          <Text style={styles.meetingDetail}>
            ⏱️ Duration: {m.duration} minutes
          </Text>
          <Text style={styles.meetingDetail}>
            📍 Location: {m.place}
          </Text>
        </View>
      )}

      <View style={styles.actions}>
        {m.state === 'none' && myRole === 'owner' && (
          <Button 
            title="Propose Meeting" 
            onPress={propose}
            color="#4A90E2"
          />
        )}
        {m.state === 'proposed' && m.proposer === 'them' && myRole === 'volunteer' && (
          <View style={styles.proposalActions}>
            <Button 
              title="Accept Proposal" 
              onPress={accept}
              color="#4CAF50"
            />
            <Button 
              title="Decline Proposal" 
              onPress={decline}
              color="#F44336"
            />
          </View>
        )}
        {m.state === 'proposed' && m.proposer === 'me' && (
          <Text style={styles.waitingText}>
            Waiting for {m.other.name} to respond to your proposal...
          </Text>
        )}
        {m.state === 'confirmed' && (
          <Text style={styles.confirmedText}>
            🎉 Meeting confirmed! You can now coordinate directly with {m.other.name}.
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    padding: 16, 
    backgroundColor: '#f8f9fa'
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center'
  },
  name: { 
    fontSize: 24, 
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4
  },
  subtitle: { 
    color: '#6B7280',
    fontSize: 16,
    marginBottom: 12
  },
  roleDescription: {
    backgroundColor: '#f0f7ff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  roleText: {
    fontSize: 14,
    color: '#4A90E2',
    fontWeight: '500',
    textAlign: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusIcon: {
    fontSize: 16,
    marginRight: 8
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600'
  },
  section: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12
  },
  promptText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    fontStyle: 'italic'
  },
  preferenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  preferenceLabel: {
    fontSize: 16,
    color: '#2c3e50',
  },
  preferenceValue: {
    fontSize: 16,
    fontWeight: '600'
  },
  inputGroup: {
    marginBottom: 16
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8
  },
  input: { 
    borderWidth: 1, 
    borderColor: '#E5E7EB', 
    padding: 12, 
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: 'white'
  },
  meetingDetail: {
    fontSize: 16,
    color: '#2c3e50',
    marginBottom: 8,
    paddingVertical: 4
  },
  actions: {
    marginTop: 20
  },
  proposalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  waitingText: {
    fontSize: 16,
    color: '#FF9800',
    textAlign: 'center',
    padding: 16,
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    fontStyle: 'italic'
  },
  confirmedText: {
    fontSize: 16,
    color: '#4CAF50',
    textAlign: 'center',
    padding: 16,
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    fontWeight: '500'
  },
  errorText: {
    fontSize: 18,
    color: '#F44336',
    textAlign: 'center',
    marginTop: 50
  }
});
