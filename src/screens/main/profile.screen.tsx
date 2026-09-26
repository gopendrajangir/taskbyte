import {
  StyleSheet,
  View,
  Image,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import React, { useState } from 'react';
import moment from 'moment';
import DeviceInfo from 'react-native-device-info';

import { Colors } from '@/config';
import { BinIcon, ChevronRightIcon, SignOutIcon, User2Icon } from '@/assets';
import {
  AppHeader,
  ConfirmationModal,
  ScreenLoader,
  ScreenSafeAreaView,
} from '@/components';
import { useAuthStore } from '@/store';
import { deleteAccount } from '@/services';
import { useAppToast } from '@/context';
import { __log, applyOpacity, openSupportEmail, openUrl } from '@/utils';
import { SUPPORT_EMAIL } from '@/config/constants';

export const ProfileScreen = () => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { user, isGuest, logout } = useAuthStore();

  const { showToast } = useAppToast();

  const { photoURL, displayName, email } = user ?? {};

  const onSuccess = () => {
    showToast({
      type: 'danger',
      message: 'Account deleted successfully',
    });
  };

  const onError = () => {
    showToast({
      type: 'danger',
      message: 'Some error occurred. Try Again',
    });
  };

  const deleteAccountHandler = () => {
    setDeleting(true);
    deleteAccount()
      .then(() => {
        onSuccess();
      })
      .catch(err => {
        __log('Error while deleting account', err);
        onError();
      })
      .finally(() => {
        setDeleting(false);
      });
  };

  return (
    <ScreenSafeAreaView edges={['top', 'bottom']}>
      <AppHeader title="Profile" />
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.avatarContainer}>
          {photoURL ? (
            <Image source={{ uri: photoURL }} style={styles.avatar} />
          ) : !isGuest && !displayName ? (
            <User2Icon
              height={110}
              width={110}
              color={Colors.textSecondary}
              style={styles.avatar}
            />
          ) : (
            <View style={styles.avatar}>
              {isGuest ? (
                <Text style={styles.guestText}>Guest</Text>
              ) : (
                <Text style={styles.avatarText}>
                  {displayName?.charAt(0).toUpperCase()}
                </Text>
              )}
            </View>
          )}
        </View>
        <View style={styles.main}>
          <Text style={styles.sectionHeading}>Profile</Text>
          <View style={[styles.section, styles.sectionMain]}>
            <View style={[styles.sectionRow]}>
              <Text style={styles.heading}>Name</Text>
              <Text style={styles.value} numberOfLines={1}>
                {displayName ?? (isGuest ? '--' : '(Anonymous)')}
              </Text>
            </View>
            <View style={[styles.sectionRow]}>
              <Text style={styles.heading}>Email</Text>
              <Text style={styles.value} numberOfLines={1}>
                {email ?? (isGuest ? '--' : '(Anonymous)')}
              </Text>
            </View>
            <View style={[styles.sectionRow]}>
              <Text style={styles.heading}>Last Synced</Text>
              <Text style={styles.value} numberOfLines={1}>
                {isGuest
                  ? '--'
                  : user?.lastSyncedAt
                  ? `Last synced ${moment(user.lastSyncedAt).fromNow()}`
                  : 'Not synced yet'}
              </Text>
            </View>
          </View>
          <Text style={styles.sectionHeading}>Legal</Text>
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.sectionRow}
              onPress={() => openUrl('terms')}
            >
              <Text style={styles.heading}>Terms of Service</Text>
              <ChevronRightIcon
                color={Colors.textSecondary}
                height={20}
                width={20}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.sectionRow}
              onPress={() => openUrl('privacy')}
            >
              <Text style={styles.heading}>Privacy Policy</Text>
              <ChevronRightIcon
                color={Colors.textSecondary}
                height={20}
                width={20}
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.sectionHeading}>Support</Text>
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.sectionRow}
              onPress={() => {
                openSupportEmail();
              }}
            >
              <Text style={styles.heading}>Contact</Text>
              <Text style={styles.value}>{SUPPORT_EMAIL}</Text>
              <ChevronRightIcon
                color={Colors.textSecondary}
                height={20}
                width={20}
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.sectionHeading}>About</Text>
          <View style={styles.section}>
            <View style={styles.sectionRow}>
              <Text style={styles.heading}>App Version</Text>
              <Text style={styles.value} numberOfLines={1}>
                {DeviceInfo.getVersion()}
              </Text>
            </View>
          </View>
          <Text style={styles.sectionHeading}>Account</Text>
          <TouchableOpacity
            style={styles.sectionBtn}
            onPress={() => {
              logout();
            }}
          >
            <Text style={styles.signOutBtnText}>Sign out</Text>
            <SignOutIcon color={Colors.red} height={20} width={20} />
          </TouchableOpacity>
          {!!user && (
            <TouchableOpacity
              style={styles.sectionBtn}
              onPress={() => {
                setShowDeleteModal(true);
              }}
            >
              <Text style={styles.signOutBtnText}>Delete Account</Text>
              <BinIcon color={Colors.red} height={20} width={20} />
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
      <ConfirmationModal
        visible={showDeleteModal}
        title="Delete Account?"
        message="Deleting your account is permanent. All your data, settings, and history will be removed and cannot be recovered. Do you want to continue?"
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={() => {
          setShowDeleteModal(false);
          deleteAccountHandler();
        }}
        confirmBtnType="danger"
        confirmText="Delete Account"
      />
      {
        <Modal visible={deleting} transparent>
          <ScreenLoader
            message="Deleting Account"
            bgColor={applyOpacity('#000', 0.8)}
          />
        </Modal>
      }
    </ScreenSafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    alignItems: 'center',
  },
  avatarContainer: {
    marginVertical: 20,
    borderRadius: 200,
    borderWidth: 2,
    borderColor: Colors.borderDark,
    padding: 3,
  },
  avatar: {
    height: 110,
    width: 110,
    borderRadius: 110,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 40,
  },
  guestText: {
    color: Colors.textSecondary,
    fontSize: 18,
    fontWeight: '600',
  },
  main: {
    flex: 1,
    alignSelf: 'stretch',
    padding: 16,
    gap: 20,
  },
  signOutBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  signOutBtnText: {
    color: Colors.red,
    fontSize: 14,
  },
  heading: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  value: {
    color: Colors.textSecondary,
    fontSize: 14,
    flex: 1,
    textAlign: 'right',
  },
  section: {
    alignSelf: 'stretch',
    backgroundColor: Colors.surface,
    padding: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.borderDark,
    borderRadius: 10,
    gap: 28,
  },
  sectionMain: {
    paddingVertical: 18,
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  sectionBtn: {
    alignSelf: 'stretch',
    backgroundColor: Colors.surface,
    padding: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.borderDark,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  sectionHeading: {
    textTransform: 'uppercase',
    color: Colors.textPrimary,
    fontSize: 12,
  },
  termsText: {
    color: Colors.textPrimary,
    fontSize: 12,
  },
});
