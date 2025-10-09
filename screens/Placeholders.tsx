import React from 'react';
import { View, Text } from 'react-native';

export const EventsScreen = () => <View><Text>Events Screen</Text></View>;
export const ProfileScreen = () => <View><Text>Profile Screen</Text></View>;
export const LoadingScreen = () => <View><Text>Loading...</Text></View>;
export const Icon = ({ name, color, size }: { name: string; color: string; size: number }) =>
  <View style={{ width: size, height: size, backgroundColor: color }} />;
