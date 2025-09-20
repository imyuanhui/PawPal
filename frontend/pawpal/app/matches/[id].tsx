import { Stack, useLocalSearchParams } from 'expo-router';
import React from 'react';
import MatchDetailScreen from '../../screens/MatchDetailScreen';

export default function MatchDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <>
      <Stack.Screen options={{ title: 'Schedule Meeting' }} />
      <MatchDetailScreen route={{ params: { matchId: id } }} />
    </>
  );
}
