import { Modal, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppButtonByType } from './app-button-by-type.component';
import { Colors } from '@/config';
import { applyOpacity } from '@/utils';
import { ScreenSafeAreaView } from './screen-safe-area-view.component';

interface Props {
  visible: boolean;
  title: string;
  message: string;
  confirmBtnType?: 'danger' | 'success';
  onCancel: () => void;
  onConfirm: () => void;
  confirmText?: string;
}

export const ConfirmationModal: React.FC<Props> = ({
  visible,
  title,
  message,
  confirmBtnType = 'success',
  confirmText = 'Confirm',
  onCancel,
  onConfirm,
}) => {
  return (
    <Modal visible={visible} transparent>
      <SafeAreaProvider style={styles.provider}>
        <ScreenSafeAreaView style={styles.container}>
          <View style={styles.modalContainer}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>
            <View style={styles.btns}>
              <AppButtonByType
                type="cancel"
                onPress={onCancel}
                style={[styles.btn, styles.btnCancel]}
                textStyle={styles.btnTextCancel}
              />
              <AppButtonByType
                type="confirm"
                title={confirmText ?? 'Confirm'}
                onPress={onConfirm}
                style={[
                  styles.btn,
                  confirmBtnType === 'success' && styles.btnSuccess,
                  confirmBtnType === 'danger' && styles.btnDanger,
                ]}
                textStyle={[
                  confirmBtnType === 'success' && styles.btnTextSuccess,
                  confirmBtnType === 'danger' && styles.btnTextDanger,
                ]}
              />
            </View>
          </View>
        </ScreenSafeAreaView>
      </SafeAreaProvider>
    </Modal>
  );
};

const styles = StyleSheet.create({
  provider: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: applyOpacity('#000', 0.8),
    justifyContent: 'center',
    padding: 16,
  },
  modalContainer: {
    padding: 16,
    paddingVertical: 20,
    borderRadius: 16,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.borderDark,
  },
  title: {
    fontSize: 16,
    color: Colors.textPrimary,
    textAlign: 'center',
    fontWeight: '500',
  },
  message: {
    color: Colors.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
    lineHeight: 18,
  },
  btns: {
    flexDirection: 'row',
    gap: 12,
  },
  btn: {
    flex: 1,
  },
  btnCancel: {
    borderColor: Colors.borderLight,
    backgroundColor: Colors.card,
  },
  btnSuccess: {
    backgroundColor: Colors.greenSoft,
    borderColor: Colors.greenSoft,
  },
  btnDanger: {
    backgroundColor: Colors.red,
    borderColor: Colors.redSoft,
  },
  btnTextCancel: {
    color: Colors.textPrimary,
  },
  btnTextSuccess: {
    color: Colors.textPrimary,
  },
  btnTextDanger: {
    color: Colors.textPrimary,
  },
  btnText: {
    fontWeight: '500',
  },
});
