import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore } from '../store/store';

export default function EditProfileScreen() {
  const { user, me, logout, setMe } = useStore();
  const [photos, setPhotos] = useState<string[]>(me.photoUrl ? [me.photoUrl] : []);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout },
      ]
    );
  };

  const handleEditProfile = () => {
    Alert.alert('Edit Profile', 'Edit profile functionality coming soon!');
  };

  const pickImage = async () => {
    if (photos.length >= 6) {
      Alert.alert('Maximum Photos', 'You can only upload up to 6 photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const newPhotos = [...photos, result.assets[0].uri];
      setPhotos(newPhotos);
      
      // Update the main profile photo (first photo)
      if (newPhotos.length === 1) {
        setMe({ ...me, photoUrl: newPhotos[0] });
      }
    }
  };

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    setPhotos(newPhotos);
    
    // Update main profile photo if we removed the first one
    if (index === 0 && newPhotos.length > 0) {
      setMe({ ...me, photoUrl: newPhotos[0] });
    } else if (newPhotos.length === 0) {
      setMe({ ...me, photoUrl: undefined });
    }
  };

  const movePhoto = (fromIndex: number, toIndex: number) => {
    const newPhotos = [...photos];
    const [movedPhoto] = newPhotos.splice(fromIndex, 1);
    newPhotos.splice(toIndex, 0, movedPhoto);
    setPhotos(newPhotos);
    
    // Update main profile photo if we moved to/from first position
    setMe({ ...me, photoUrl: newPhotos[0] });
  };

  const openPhotoModal = (index: number) => {
    setSelectedPhotoIndex(index);
  };

  const closePhotoModal = () => {
    setSelectedPhotoIndex(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            {photos.length > 0 ? (
              <Image source={{ uri: photos[0] }} style={styles.mainPhoto} />
            ) : (
              <Ionicons name="person-circle" size={80} color="#4A90E2" />
            )}
          </View>
          <Text style={styles.name}>{me.name}</Text>
          <Text style={styles.role}>
            {me.role === 'owner' ? 'Pet Owner' : 
             me.role === 'volunteer' ? 'Volunteer' : 
             'Pet Owner & Volunteer'}
          </Text>
          <Text style={styles.location}>
            <Ionicons name="location-outline" size={16} color="#666" /> {me.city || 'No location set'}
          </Text>
        </View>

        {/* Photos Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Photos</Text>
          <Text style={styles.sectionSubtitle}>
            Add photos of yourself and your dogs (up to 6 photos)
          </Text>
          
          <View style={styles.photosGrid}>
            {photos.map((photo, index) => (
              <View key={index} style={styles.photoContainer}>
                <TouchableOpacity
                  style={styles.photoWrapper}
                  onPress={() => openPhotoModal(index)}
                >
                  <Image source={{ uri: photo }} style={styles.photo} />
                  {index === 0 && (
                    <View style={styles.mainPhotoBadge}>
                      <Text style={styles.mainPhotoText}>Main</Text>
                    </View>
                  )}
                </TouchableOpacity>
                
                <View style={styles.photoActions}>
                  {index > 0 && (
                    <TouchableOpacity
                      style={styles.photoActionButton}
                      onPress={() => movePhoto(index, index - 1)}
                    >
                      <Ionicons name="arrow-up" size={16} color="#4A90E2" />
                    </TouchableOpacity>
                  )}
                  
                  {index < photos.length - 1 && (
                    <TouchableOpacity
                      style={styles.photoActionButton}
                      onPress={() => movePhoto(index, index + 1)}
                    >
                      <Ionicons name="arrow-down" size={16} color="#4A90E2" />
                    </TouchableOpacity>
                  )}
                  
                  <TouchableOpacity
                    style={styles.photoActionButton}
                    onPress={() => removePhoto(index)}
                  >
                    <Ionicons name="trash" size={16} color="#F44336" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
            
            {photos.length < 6 && (
              <TouchableOpacity style={styles.addPhotoButton} onPress={pickImage}>
                <Ionicons name="camera" size={24} color="#4A90E2" />
                <Text style={styles.addPhotoText}>Add Photo</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Information</Text>
          
          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={20} color="#666" />
            <Text style={styles.infoText}>{user?.email || 'No email'}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={20} color="#666" />
            <Text style={styles.infoText}>{me.name}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Ionicons name="paw-outline" size={20} color="#666" />
            <Text style={styles.infoText}>
              {me.role === 'owner' ? 'Pet Owner' : 
               me.role === 'volunteer' ? 'Volunteer' : 
               'Pet Owner & Volunteer'}
            </Text>
          </View>
        </View>

        {me.prompt1 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About Me</Text>
            <Text style={styles.promptText}>{me.prompt1}</Text>
          </View>
        )}

        {me.prompt2 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Experience</Text>
            <Text style={styles.promptText}>{me.prompt2}</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          
          <View style={styles.preferenceRow}>
            <Text style={styles.preferenceLabel}>Large dogs OK</Text>
            <Ionicons 
              name={me.largeOk ? 'checkmark-circle' : 'close-circle'} 
              size={24} 
              color={me.largeOk ? '#4CAF50' : '#F44336'} 
            />
          </View>
          
          <View style={styles.preferenceRow}>
            <Text style={styles.preferenceLabel}>Reactive dogs OK</Text>
            <Ionicons 
              name={me.reactiveOk ? 'checkmark-circle' : 'close-circle'} 
              size={24} 
              color={me.reactiveOk ? '#4CAF50' : '#F44336'} 
            />
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleEditProfile}>
            <Ionicons name="create-outline" size={20} color="#4A90E2" />
            <Text style={styles.actionButtonText}>Edit Profile</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#F44336" />
            <Text style={[styles.actionButtonText, { color: '#F44336' }]}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Photo Modal */}
      <Modal
        visible={selectedPhotoIndex !== null}
        transparent
        animationType="fade"
        onRequestClose={closePhotoModal}
      >
        <Pressable style={styles.modalOverlay} onPress={closePhotoModal}>
          <View style={styles.modalContent}>
            {selectedPhotoIndex !== null && (
              <Image 
                source={{ uri: photos[selectedPhotoIndex] }} 
                style={styles.modalPhoto} 
                resizeMode="contain"
              />
            )}
            <TouchableOpacity style={styles.closeButton} onPress={closePhotoModal}>
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
    backgroundColor: 'white',
    marginBottom: 20,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  mainPhoto: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  role: {
    fontSize: 16,
    color: '#4A90E2',
    fontWeight: '600',
    marginBottom: 8,
  },
  location: {
    fontSize: 14,
    color: '#666',
    flexDirection: 'row',
    alignItems: 'center',
  },
  section: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  photoContainer: {
    width: '30%',
    marginBottom: 12,
  },
  photoWrapper: {
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: 100,
    borderRadius: 8,
  },
  mainPhotoBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#4A90E2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  mainPhotoText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  photoActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 4,
  },
  photoActionButton: {
    padding: 4,
    marginHorizontal: 2,
  },
  addPhotoButton: {
    width: '30%',
    height: 100,
    borderWidth: 2,
    borderColor: '#4A90E2',
    borderStyle: 'dashed',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  addPhotoText: {
    color: '#4A90E2',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 16,
    color: '#2c3e50',
    marginLeft: 12,
  },
  promptText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
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
  actions: {
    marginHorizontal: 20,
    marginBottom: 30,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e1e8ed',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A90E2',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    height: '70%',
    position: 'relative',
  },
  modalPhoto: {
    width: '100%',
    height: '100%',
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
  },
});

