import { Ionicons } from '@expo/vector-icons';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';

type FeedbackType = 'success' | 'warning' | 'error' | 'location' | 'info';

type FeedbackModalProps = {
  visible: boolean;
  title: string;
  message: string;
  type?: FeedbackType;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
  theme: any;
};

const CONFIG = {
  success: { icon: 'checkmark-circle' as const, color: '#27AE60', background: '#EAF9F0' },
  warning: { icon: 'warning' as const, color: '#F4A340', background: '#FFF6E8' },
  error: { icon: 'close-circle' as const, color: '#FF5B65', background: '#FFF0F1' },
  location: { icon: 'location' as const, color: '#7B4DFF', background: '#F3EDFF' },
  info: { icon: 'information-circle' as const, color: '#7B4DFF', background: '#F3EDFF' },
};

export default function FeedbackModal({
  visible,
  title,
  message,
  type = 'info',
  confirmText = 'Entendi',
  cancelText = 'Cancelar',
  showCancel = false,
  onConfirm,
  onCancel,
  theme,
}: FeedbackModalProps) {
  const { width } = useWindowDimensions();
  const config = CONFIG[type];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onCancel ?? onConfirm}
    >
      <Pressable style={styles.overlay} onPress={showCancel ? onCancel : undefined}>
        <Pressable
          style={[
            styles.card,
            {
              width: Math.min(width - 40, 390),
              backgroundColor: theme.backgroundCard,
            },
          ]}
          onPress={(event) => event.stopPropagation()}
        >
          <View style={[styles.icon, { backgroundColor: config.background }]}>
            <Ionicons name={config.icon} size={34} color={config.color} />
          </View>

          <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
          <Text style={[styles.message, { color: theme.textSecondary }]}>
            {message}
          </Text>

          <View style={styles.actions}>
            {showCancel && (
              <TouchableOpacity
                style={[
                  styles.button,
                  {
                    backgroundColor: theme.backgroundSoft,
                    borderColor: theme.borderInput,
                  },
                ]}
                onPress={onCancel}
              >
                <Text style={[styles.cancelText, { color: theme.text }]}>
                  {cancelText}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.button, styles.confirmButton]}
              onPress={onConfirm}
            >
              <Text style={styles.confirmText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(31,22,68,0.48)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  card: {
    borderRadius: 28,
    paddingHorizontal: 22,
    paddingTop: 26,
    paddingBottom: 20,
    alignItems: 'center',
    elevation: 12,
  },
  icon: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    textAlign: 'center',
  },
  message: {
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 22,
  },
  actions: { width: '100%', flexDirection: 'row', gap: 10 },
  button: {
    flex: 1,
    minHeight: 50,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  confirmButton: { backgroundColor: '#7B4DFF', borderColor: '#7B4DFF' },
  cancelText: { fontFamily: 'Poppins-SemiBold', fontSize: 12 },
  confirmText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 12,
    color: '#FFFFFF',
    textAlign: 'center',
  },
});
