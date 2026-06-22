import { View, Text, StyleSheet } from 'react-native';

export default function Placeholder({ screenName }: { screenName: string }) {
  return (
    <View style={styles.container}>
      <Text>A tela de {screenName} ainda precisa ser programada.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});