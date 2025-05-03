import React, { useState, useEffect, useMemo } from 'react';
import {
  Alert,
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Modal,
  ScrollView,
  TextInput,
  Button,
  StyleProp,
  ViewStyle,
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import {
  collection,
  deleteDoc,
  getDocs,
  orderBy,
  query,
  where,
  updateDoc,
  doc as firestoreDoc,
} from 'firebase/firestore';
import { deleteObject, ref } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { ImageBackground } from 'react-native';

/* ────────────────────────────────────────────────────────────── */
/*  Types                                                        */
/* ────────────────────────────────────────────────────────────── */
interface Artwork {
  id: string;
  url: string;
  category: string;
  project?: string;
  title?: string;
  description?: string;
  createdAt: any;
  ownerUid: string;
}

/* ────────────────────────────────────────────────────────────── */
/*  Polaroid Component                                           */
/* ────────────────────────────────────────────────────────────── */
function Polaroid({
  uri,
  caption,
  onPress,
  onLongPress,
  style,
}: {
  uri: string;
  caption?: string;
  onPress: () => void;
  onLongPress?: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={[styles.polaroidContainer, style]}
    >
      <Image source={{ uri }} style={styles.polaroidImage} />
      {caption != null && (
        <Text numberOfLines={1} style={styles.polaroidCaption}>
          {caption}
        </Text>
      )}
    </Pressable>
  );
}

/* ────────────────────────────────────────────────────────────── */
/*  ProfileScreen                                                */
/* ────────────────────────────────────────────────────────────── */
export default function ProfileScreen() {
  /* UI state */
  const [activeTab, setActiveTab] = useState<'uploads' | 'badges' | 'todo'>('uploads');
  const [hobbyFilter, setHobbyFilter] = useState<string | null>(null);
  const [zoomedArtwork, setZoomedArtwork] = useState<Artwork | null>(null);
  const [editingItem, setEditingItem] = useState<Artwork | null>(null);
  const [zoomLoading, setZoomLoading] = useState(false);
  const [editCategoryOpen, setEditCategoryOpen] = useState(false);

  /* Data state */
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  /* Filter dropdown state */
  const [filterText, setFilterText] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  /* Edit form state */
  const [editCategory, setEditCategory] = useState('');
  const [editProject, setEditProject] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  // Track which sections are expanded
const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

// Toggles a section’s expanded state
const toggleSection = (title: string) => {
  setExpandedSections(prev => ({
    ...prev,
    [title]: !prev[title],
  }));
};

  /* Load artworks on mount and on tab switch */
  useEffect(() => {
    fetchMyArtworks();
  }, []);
  useEffect(() => {
    if (activeTab === 'uploads') {
      fetchMyArtworks();
    }
  }, [activeTab]);
  useEffect(() => {
    if (zoomedArtwork) {
      setZoomLoading(true);
    }
  }, [zoomedArtwork]);

  async function fetchMyArtworks() {
    try {
      setLoading(true);
      const snap = await getDocs(
        query(
          collection(db, 'artworks'),
          where('ownerUid', '==', 'anon'),
          orderBy('createdAt', 'desc')
        )
      );
      const items = snap.docs.map((d) => {
        const data = d.data() as any;
        return {
          id: d.id,
          url: data.url,
          category: data.category ?? data.hobby,
          project: data.project,
          title: data.title,
          description: data.description,
          createdAt: data.createdAt,
          ownerUid: data.ownerUid,
        } as Artwork;
      });
      setArtworks(items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function deleteArtwork(item: Artwork) {
    Alert.alert('Delete?', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteDoc(firestoreDoc(db, 'artworks', item.id));
          const decoded = decodeURIComponent(item.url.split('?')[0]);
          const path = decoded.split('/o/')[1];
          await deleteObject(ref(storage, path));
          fetchMyArtworks();
        },
      },
    ]);
  }

  const onRefresh = () => {
    setRefreshing(true);
    fetchMyArtworks();
  };

  /* Hobby suggestions */
  const hobbies = useMemo(
    () =>
      Array.from(new Set(artworks.map((a) => a.category).filter(Boolean))),
    [artworks]
  );
  const suggestionItems = hobbies.includes(filterText)
    ? hobbies
    : hobbies.filter((h) =>
        h.toLowerCase().includes(filterText.toLowerCase())
      );

  const CRAFT_HOBBIES = [
        { label: 'Watercolor',    value: 'Watercolor'    },
        { label: 'Oil Painting',  value: 'Oil Painting'  },
        { label: 'Digital Art',   value: 'Digital Art'   },
        { label: 'Sketch',        value: 'Sketch'        },
        { label: 'Ceramics',      value: 'Ceramics'      },
        { label: 'Woodworking',   value: 'Woodworking'   },
        { label: 'Knitting',      value: 'Knitting'      },
        { label: 'Scrapbooking',  value: 'Scrapbooking'  },
        { label: 'Jewelry Making',value: 'Jewelry Making'},
        { label: 'Paper Crafts',  value: 'Paper Crafts'  },
      ];

  /* Seed edit form when selecting an item */
  useEffect(() => {
    if (editingItem) {
      setEditCategory(editingItem.category);
      setEditProject(editingItem.project || '');
      setEditTitle(editingItem.title || '');
      setEditDescription(editingItem.description || '');
    }
  }, [editingItem]);

  /* Build sections */
  const filteredArtworks = useMemo(
    () =>
      hobbyFilter
        ? artworks.filter((a) => a.category === hobbyFilter)
        : artworks,
    [artworks, hobbyFilter]
  );
  const sections = useMemo(() => {
    const sorted = [...filteredArtworks].sort(
      (a, b) => b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime()
    );
    const result: { title: string; data: Artwork[] }[] = [];
    const oneOffs = sorted.filter((a) => !a.project);
    if (oneOffs.length) result.push({ title: 'One-offs', data: oneOffs });
    const projects = Array.from(
      new Set(sorted.filter((a) => !!a.project).map((a) => a.project!))
    );
    projects.forEach((proj) =>
      result.push({
        title: proj,
        data: sorted.filter((a) => a.project === proj),
      })
    );
    return result;
  }, [filteredArtworks]);

  /* Render uploads tab */
  const renderUploadsTab = () => (
    <>
      <View style={styles.filterContainer}>
        <TextInput
          style={styles.filterInput}
          placeholder="All"
          value={filterText}
          onFocus={() => setShowSuggestions(true)}
          onChangeText={(text) => {
            setFilterText(text);
            if (text === '') setHobbyFilter(null);
            setShowSuggestions(text.length > 0);
          }}
        />
        {showSuggestions && (
          <ScrollView style={styles.suggestionsList}>
            <Pressable
              key="all"
              style={styles.suggestionItem}
              onPress={() => {
                setHobbyFilter(null);
                setFilterText('');
                setShowSuggestions(false);
              }}
            >
              <Text>All</Text>
            </Pressable>
            {suggestionItems.map((h) => (
              <Pressable
                key={h}
                style={styles.suggestionItem}
                onPress={() => {
                  setHobbyFilter(h);
                  setFilterText(h);
                  setShowSuggestions(false);
                }}
              >
                <Text>{h}</Text>
              </Pressable>
            ))}
          </ScrollView>
        )}
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 20 }} />
      ) : sections.length === 0 ? (
        <View style={{ alignItems: 'center', marginTop: 40 }}>
          <Text style={{ fontSize: 16, color: '#888' }}>
            No uploads yet.
          </Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {sections.map((sec) => (
            <View key={sec.title} style={styles.sectionContainer}>
              <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionHeader}>{sec.title}</Text>
                {sec.data.length > 3 && (
                  <Pressable
                    style={styles.toggleButton}
                    onPress={() => toggleSection(sec.title)}
                  >
                    <Text style={styles.toggleButtonText}>
                      {expandedSections[sec.title] ? '-' : '+'}
                    </Text>
                  </Pressable>
                )}
              </View>
              {expandedSections[sec.title] ? (
                // ▶ Expanded: full 3-column grid
                <View style={styles.gridContainer}>
                  {sec.data.map(item => (
                    <Polaroid
                      key={`${sec.title}-${item.id}`}
                      uri={item.url}
                      caption={item.title}
                      onPress={() => setZoomedArtwork(item)}
                      onLongPress={() => deleteArtwork(item)}
                    />
                  ))}
                </View>
              ) : (
              <FlatList
                data={sec.data}
                horizontal
                keyExtractor={(item) => `${sec.title}-${item.id}`}
                renderItem={({ item }) => (
                  <Polaroid
                    uri={item.url}
                    caption={item.title}
                    onPress={() => setZoomedArtwork(item)}
                    onLongPress={() => deleteArtwork(item)}
                  />
                )}
                showsHorizontalScrollIndicator={false}
              />
              )}
            </View>
          ))}
        </ScrollView>
      )}
    </>
  );
 
  
  /* Main render */
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Zoom modal */}
 {/* Combined Zoom + Edit Modal */}
      {zoomedArtwork && (
        <Modal
          transparent
          animationType="fade"
          visible
          onRequestClose={() => setZoomedArtwork(null)}
        >
          {/* 1) Full‐screen backdrop: tap anywhere to cancel zoom (unless editing) */}
          <Pressable
            style={styles.modalBackground}
            onPress={() => {
              if (!editingItem) {
                // only close if not in edit mode
                requestAnimationFrame(() => setZoomedArtwork(null));
              }
            }}
          />

          {/* 2) Centered content */}
          <View style={styles.modalOverlay}>
            {zoomLoading && (
                <ActivityIndicator
                  size="large"
                  color="#fff"
                  style={styles.modalSpinner}
                />
              )}

            {editingItem ? (
              // ── EDIT FORM ──────────────────────────
              <View style={[styles.editModal, { backgroundColor: 'white' }]}>
                <Polaroid 
                  uri={editingItem.url}
                  caption={editingItem.title}
                  onPress={() => {}}
                  onLongPress={() => {}}
                  style={styles.miniPolaroid}
                />  
                <Text style={styles.modalHeader}>Now editing : "{editingItem.title}"</Text>

                <Text>Hobby:</Text>
                <DropDownPicker
                  open={editCategoryOpen}
                  value={editCategory}
                  items={CRAFT_HOBBIES}
                  setOpen={setEditCategoryOpen}
                  setValue={setEditCategory}
                  setItems={() => {}}
                  placeholder="Select or search hobby..."
                  searchable={true}
                  searchPlaceholder="Search hobbies..."
                  containerStyle={{ marginBottom: 12 }}
                  dropDownContainerStyle={{ zIndex: 1000 }}
                  listItemContainerStyle={{ zIndex: 1000 }}
                  zIndex={1000}
                  zIndexInverse={1000}
                />

                <Text>Project:</Text>
                <TextInput
                  style={styles.input}
                  value={editProject}
                  onChangeText={setEditProject}
                />

                <Text>Title:</Text>
                <TextInput
                  style={styles.input}
                  value={editTitle}
                  onChangeText={setEditTitle}
                />

                <Text>Description:</Text>
                <TextInput
                  style={[styles.input, { height: 80 }]}
                  value={editDescription}
                  onChangeText={setEditDescription}
                  multiline
                />

                <View style={styles.modalButtons}>
                  <Button title="Cancel" onPress={() => setEditingItem(null)} />
                  <Button
                    title="Save"
                    onPress={async () => {
                      await updateDoc(
                        firestoreDoc(db, 'artworks', editingItem.id),
                        {
                          category: editCategory,
                          ...(editProject.trim() && {
                            project: editProject.trim(),
                          }),
                          title: editTitle,
                          description: editDescription,
                        }
                      );
                      fetchMyArtworks();
                      setEditingItem(null);
                    }}
                  />
                </View>
              </View>
            ) : (
              // ── ZOOMED IMAGE + PENCIL ─────────────────
              <>
                <Image
                  source={{ uri: zoomedArtwork.url }}
                  style={styles.modalImage}
                  resizeMode="contain"
                  onLoadStart={() => setZoomLoading(true)}
                  onLoadEnd={() => setZoomLoading(false)}
                />

                <Pressable
                  style={styles.modalEditButton}
                  onPress={() => {
                    setEditingItem(zoomedArtwork);
                  }}
                >
                  <Text style={[styles.modalEditText, { fontSize: 28 }]}>
                    ✏️
                  </Text>
                </Pressable>
              {/* ← Back button in bottom-left */}
                <Pressable
                  style={styles.modalBackButton}
                  onPress={() => setZoomedArtwork(null)}
                >
                  <Text style={styles.modalBackText}>← Back</Text>
                </Pressable>
              </>
            )}
          </View>
        </Modal>
      )}

      {/* Header & Tab Bar */}
      <ImageBackground
      source={require('@/assets/cork-bg.jpg')}
      style={styles.corkBackground}
      imageStyle={{ resizeMode: 'cover' }}
        >
      <View style={[styles.header, { backgroundColor: 'transparent' }]}>
        <Text style={styles.username}>@anon</Text>
        <Text style={styles.subheader}>
          {artworks.length} {artworks.length === 1 ? 'upload' : 'uploads'}
        </Text>
      </View>
      <View style={[styles.tabBar, { backgroundColor: 'transparent' }]}>
        {(['uploads', 'badges', 'todo'] as const).map((k) => (
          <Pressable
            key={k}
            onPress={() => setActiveTab(k)}
            style={[
              styles.tabItem,
              activeTab === k && styles.tabActive,
            ]}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === k && styles.tabTextActive,
              ]}
            >
              {k === 'uploads'
                ? 'Uploads'
                : k === 'badges'
                ? 'Badges'
                : 'To-Do'}
            </Text>
          </Pressable>
        ))}
      </View>
      </ImageBackground>
      {/* Tab content */}
      {activeTab === 'uploads'
        ? renderUploadsTab()
        : activeTab === 'badges'
        ? (
          <View style={styles.placeholder}>
            <Text>Badges coming soon!</Text>
          </View>
        )
        : (
          <View style={styles.placeholder}>
            <Text>To-Do coming soon!</Text>
          </View>
        )}
    </SafeAreaView>
  );
}

/* ────────────────────────────────────────────────────────────── */
/*  Styles                                                       */
/* ────────────────────────────────────────────────────────────── */
const styles = StyleSheet.create({
  /* Polaroid */
  polaroidContainer: {
    backgroundColor: '#fff',
    padding: 8,
    paddingBottom: 20,
    borderRadius: 4,
    margin: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  polaroidImage: { width: 100, height: 100, borderRadius: 2, backgroundColor: '#eee' },
  polaroidCaption: {
    marginTop: 4,
    fontSize: 12,
    color: '#333',
    width: '100%',
    textAlign: 'center',
  },

  /* Filter */
  filterContainer: {
    marginHorizontal: 12,
    marginBottom: 12,
    position: 'relative',
    margin: 8,
    zIndex: 1,
  },
  filterInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  suggestionsList: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    maxHeight: 120,
    marginTop: 4,
    zIndex: 2,
  },
  suggestionItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },

  /* Sections */
  sectionContainer: { marginBottom: 24 },
  sectionHeader: { fontSize: 18, fontWeight: '600', marginLeft: 12, marginBottom: 8 },

  /* Header & Tabs */
  header: { alignItems: 'center', marginTop: 20, marginBottom: 12 },
  username: { fontSize: 24, fontWeight: 'bold' },
  subheader: { fontSize: 16, color: '#666', marginTop: 4 },
  tabBar: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#e5e5e5' },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: '#000' },
  tabText: { fontSize: 16, fontWeight: '600', color: '#666' },
  tabTextActive: { fontWeight: 'bold', color: '#000' },

  /* Modals */
  modalBackground: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  modalOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  modalImage: { width: '90%', height: '90%', borderRadius: 8 },
  modalEditButton: {
    position: 'absolute',
    bottom: '15%',
    right: '10%',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 30,
    padding: 16,
  },
  modalEditText: { textAlign: 'center' },

  /* Edit form */
  editModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    elevation: 100,
  },
  editModal: { width: '80%', backgroundColor: 'white', borderRadius: 8, padding: 16 },
  modalHeader: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 8, marginBottom: 12 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },

  /* Placeholder */
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  modalContent: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackButton: {
    position: 'absolute',
    bottom: '10%',
    left: '10%',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    zIndex: 11,
    elevation: 11,    // for Android
  },
  modalBackText: {
    fontSize: 18,
    color: '#000',
  },
  modalSpinner: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -20,  // half of spinner size
    marginTop: -20,   // half of spinner size
    zIndex: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  toggleButton: {
    padding: 4,
  },
  toggleButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  gridItemFull: {
    width: '30%',
    marginBottom: 12,
    alignItems: 'center',
  },
  thumb: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#eee',
  },
  miniPolaroid: {
    backgroundColor: '#fff',
    padding: 8,
    paddingBottom: 5,
    borderRadius: 4,
    margin: 10,
    alignItems: 'center',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  corkBackground: {
    width: '100%',
    // height to cover just header + tabs:
    // adjust if your header+tabs total ~100px tall
    height: 120,
  },
});