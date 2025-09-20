import { Stack } from 'expo-router';

export default function MatchStack() {
  return (
    <Stack 
      screenOptions={{ 
        headerTitleAlign: 'center'
      }}
    >
      <Stack.Screen 
        name="index" 
        options={{ 
          title: 'Matches',
          headerShown: false 
        }} 
      />
      <Stack.Screen 
        name="[id]" 
        options={{ 
          title: 'Schedule Meeting',
          headerShown: true 
        }} 
      />
    </Stack>
  );
}