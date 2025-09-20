import { View, Text, Image, StyleSheet } from 'react-native';
import { Profile } from '../types/domain';

export default function ProfileCard({ profile }: { profile: Profile }) {
  return (
    <View style={styles.card}>
      {profile.photoUrl ? (
        <Image source={{ uri: profile.photoUrl }} style={styles.photo} />
      ) : (
        <View style={[styles.photo, styles.placeholder]}>
          <Text style={{ fontSize: 44 }}>🐶</Text>
        </View>
      )}

      <Text style={styles.name}>{profile.name}</Text>
      <Text style={styles.muted}>{profile.city ?? '—'} · {profile.role}</Text>

      {profile.prompt1 ? <Text style={styles.prompt}>“{profile.prompt1}”</Text> : null}
      {profile.prompt2 ? <Text numberOfLines={2} style={styles.prompt2}>“{profile.prompt2}”</Text> : null}

      <View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
        {profile.largeOk ? <Text style={styles.badge}>Large-dog ✓</Text> : null}
        {profile.reactiveOk ? <Text style={[styles.badge, { backgroundColor: '#FFF3E0' }]}>Reactive ✓</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius:16, borderWidth:1, borderColor:'#E5E7EB', backgroundColor:'#fff', padding:16 },
  photo: { height:260, borderRadius:12, marginBottom:12 },
  placeholder:{ backgroundColor:'#F3F4F6', alignItems:'center', justifyContent:'center' },
  name: { fontSize:24, fontWeight:'600' },
  muted: { color:'#6B7280' },
  prompt: { marginTop:6 },
  prompt2: { color:'#374151' },
  badge: { fontSize:12, paddingHorizontal:8, paddingVertical:4, backgroundColor:'#E8F5E9', borderRadius:12 },
});
