import React, { useState, useEffect, useMemo } from 'react';
import ArtworkEditForm from '@/components/editingforms/ArtworkEditForm';
import {Alert, ActivityIndicator, FlatList, Image, Pressable, RefreshControl, SafeAreaView, StyleSheet, Text, View, Modal, ScrollView, TextInput, Button, StyleProp, ViewStyle, LayoutChangeEvent, } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { collection, deleteDoc, getDocs, orderBy, query, where, updateDoc, doc as firestoreDoc, writeBatch, doc, serverTimestamp, addDoc} from 'firebase/firestore';
import { deleteObject, ref } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { ImageBackground } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { themecolors, typography } from "@/constants/Colors";
import { Feather } from "@expo/vector-icons";

// Extracted UI components
import Polaroid from '@/components/profilescreen/Polaroid';
import TabNote from '@/components/profilescreen/TabNote';
import Section from '@/components/profilescreen/Section';
import ArtworkZoom from '@/components/profilescreen/ArtworkZoom';
import RenameProjectModal from '@/components/editingforms/RenameProjectModal';
import HobbyFilter from '@/components/profilescreen/HobbyFilter';
import WhiteboardHeader from '@/components/profilescreen/WhiteboardHeader';

// Extracted hooks
import { useWhiteboard } from '@/hooks/ProfileHooks/useWhiteboard';
import { useTabs } from '@/hooks/ProfileHooks/useTabs';

// Extracted types
import type { Artwork } from '@/app/types/artwork';
// This screen shows the user's artwork in a cork-board style layout and also includes a to-do list.


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
  const insets = useSafeAreaInsets();

  // which project are we renaming, and the draft name
  const [editingProject, setEditingProject]   = useState<string|null>(null);
  const [newProjectName,  setNewProjectName]  = useState<string>('');

  /* Data state */
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  /* Filter dropdown state */
  const [filterText, setFilterText] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showAllDetails, setShowAllDetails] = useState(false);
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
    if (activeTab === 'uploads') {
      fetchMyArtworks();
    }
  }, [activeTab]);

  // Pulls the user's artworks from Firestore in newest-first order

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

  // Remove artwork from Firestore and its image from storage

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
    () => {
      const unique = Array.from(new Set(artworks.map((a) => a.category).filter(Boolean)));
      return unique.sort((x, y) => x.localeCompare(y));
    },
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
  // Group artworks by project and sort them

  const sections = useMemo(() => {
    const sorted = [...filteredArtworks].sort(
      (a, b) => b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime()
    );
    const result: { title: string; data: Artwork[] }[] = [];
    const oneOffs = sorted.filter((a) => !a.project);
    if (oneOffs.length) result.push({ title: 'Loose Ends', data: oneOffs });
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

  useEffect(() => {
    const initial = sections.reduce((acc, sec) => {
      acc[sec.title] = true;
      return acc;
    }, {} as Record<string, boolean>);
    setExpandedSections(initial);
  }, [sections]);

  /* Render uploads tab */
  const renderUploadsTab = () => (
    <>
      <HobbyFilter
        filterText={filterText}
        onShowAllDetails={() => setShowAllDetails(prev => !prev)}
        onFocus={() => setShowSuggestions(true)}
        onChangeText={(text) => {
          setFilterText(text);
          if (text === '') setHobbyFilter(null);
          setShowSuggestions(text.length > 0);
        }}
        onSelectSuggestion={(h) => {
          setHobbyFilter(h);
          setFilterText(h ?? '');
          setShowSuggestions(false);
        }}
        showSuggestions={showSuggestions}
        suggestionItems={suggestionItems}
        onBlur={() => setShowSuggestions(false)}
      />
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
          {sections.map((sec, idx) => (
            <Section
              key={sec.title}
              idx={idx}
              onEdit={() => {
                setEditingProject(sec.title);
                setNewProjectName(sec.title);
              }}
              title={sec.title}
              data={sec.data}
              expanded={expandedSections[sec.title]}
              onToggle={() => toggleSection(sec.title)}
              onItemPress={setZoomedArtwork}
              onItemLongPress={deleteArtwork}
              showAllDetails={showAllDetails}
            />
          ))}
        </ScrollView>
      )}
    </>
  );

  //Render TO DO 
  const [tasks, setTasks] = useState<{ id: string; title: string; completed: boolean }[]>([]);
  const [newTask, setNewTask] = useState('');
  // which task is being edited right now?
const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
// the draft text for that task
const [editingTaskText, setEditingTaskText] = useState('');

  useEffect(() => { fetchTasks(); }, []);

  // Fetch all to-do tasks from Firestore

  async function fetchTasks() {
    const snap = await getDocs(
      query(collection(db, 'todos'), orderBy('createdAt', 'asc'))
    );
    setTasks(snap.docs.map(d => ({
      id: d.id,
      title: d.data().title as string,
      completed: d.data().completed as boolean,
    })));
  }

  // Add a new item to the to-do list

  async function addTask() {
    if (!newTask.trim()) return;
    await addDoc(collection(db, 'todos'), {
      title: newTask.trim(),
      completed: false,
      createdAt: serverTimestamp(),
    });
    setNewTask('');
    fetchTasks();
  }

  // Mark a task as complete or incomplete

  async function toggleComplete(task: { id: string; completed: boolean }) {
    await updateDoc(doc(db, 'todos', task.id), {
      completed: !task.completed,
    });
    fetchTasks();
  }

  // Remove a task from the database

  async function deleteTask(id: string) {
    await deleteDoc(doc(db, 'todos', id));
    fetchTasks();
  }
  // Renders the list of tasks with add/edit/delete features

  const renderToDoTab = () => (
        
          <SafeAreaView style={{ flex: 1, padding: 16,margin: 19 }}>
             <ImageBackground
                source={require('@/assets/images/ToDo-bg.png')}
                style={{ flex: 1,    shadowOpacity: .8,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowRadius: 2, }}
                imageStyle={{ resizeMode: 'cover' }}
              >
            {/* Add-task row */}
            <View style={styles.inputRow}>
              <TextInput
                style={styles.taskinput}
                placeholder="Add Task Here ..."
                value={newTask}
                onChangeText={setNewTask}
              />
                <Pressable style={styles.addButton} onPress={addTask}>
                  <Text style={styles.addButtonText}>＋</Text>
                 </Pressable>
            </View>
        
            {/* Task list */}
            <FlatList
              data={tasks}
              keyExtractor={t => t.id}
              renderItem={({ item }) => (
                      <View style={styles.taskRow}>
                      {/* 1) Checkbox */}
                      <Pressable onPress={() => toggleComplete(item)}>
                        <Text style={item.completed ? styles.taskDone : styles.taskText}>
                          {item.completed ? '☑' : '☐'}
                        </Text>
                      </Pressable>
                
                      {/* 2) Title or Editor */}
                      {editingTaskId === item.id ? (
                        <TextInput
                          style={[styles.taskText, styles.taskInput]}
                          value={editingTaskText}
                          onChangeText={setEditingTaskText}
                          autoFocus
                          onBlur={async () => {
                            // commit change on blur
                            if (editingTaskText.trim() && editingTaskText !== item.title) {
                              await updateDoc(doc(db,'todos',item.id), {
                                title: editingTaskText.trim()
                              });
                              fetchTasks();
                            }
                            setEditingTaskId(null);
                          }}
                          onSubmitEditing={async () => {
                            // also commit on enter
                            if (editingTaskText.trim() && editingTaskText !== item.title) {
                              await updateDoc(doc(db,'todos',item.id), {
                                title: editingTaskText.trim()
                              });
                              fetchTasks();
                            }
                            setEditingTaskId(null);
                          }}
                        />
                      ) : (
                        <Pressable
                          style={styles.taskTitleContainer}
                          onPress={() => {
                            setEditingTaskId(item.id);
                            setEditingTaskText(item.title);
                          }}
                        >
                          <Text style={item.completed ? styles.taskDone : styles.taskText}>
                            {item.title}
                          </Text>
                        </Pressable>
                      )}
                
                      {/* 3) Delete */}
                      <Pressable onPress={() => deleteTask(item.id)}>
                        <Text style={styles.delete}>❌</Text>
                      </Pressable>
                    </View>
                  )}
                />
            </ImageBackground>
          </SafeAreaView>
        );
  
  /* Main render */
  return (
      <View style={{ flex: 1 }}>
        {/* Combined Zoom + Edit Modal replaced by ArtworkZoom */}
        {zoomedArtwork && (
          <ArtworkZoom
            artwork={zoomedArtwork}
            loading={zoomLoading}
            onEdit={() => {
              setZoomedArtwork(null);
              setEditingItem(zoomedArtwork);
            }}
            onClose={() => setZoomedArtwork(null)}
            onLoadStart={() => setZoomLoading(true)}
            onLoadEnd={() => setZoomLoading(false)}
          />
        )}
        
        {editingItem && (
          <ArtworkEditForm
            artwork={editingItem}
            onCancel={() => setEditingItem(null)}
            onSave={async (updates) => {
              await updateDoc(
                firestoreDoc(db, 'artworks', editingItem.id),
                {
                  category: updates.category,
                  ...(updates.project ? { project: updates.project } : {}),
                  title: updates.title,
                  description: updates.description,
                }
              );
              fetchMyArtworks();
              setEditingItem(null);
            }}
          />
        )}
        {/* Rename-Project Modal */}
        {editingProject && (
          <RenameProjectModal
            projectName={editingProject}
            draftName={newProjectName}
            onChangeDraftName={setNewProjectName}
            onCancel={() => setEditingProject(null)}
            onSave={async () => {
              const batch = writeBatch(db);
              artworks
                .filter(a => a.project === editingProject)
                .forEach(a =>
                  batch.update(
                    firestoreDoc(db, 'artworks', a.id),
                    { project: newProjectName.trim() }
                  )
                );
              await batch.commit();
              setEditingProject(null);
              fetchMyArtworks();
            }}
          />
        )}
        {/* Cork‐board header + tabs */}
        <View style={styles.corkContainer}>
        <WhiteboardHeader>
          <View style={[styles.header, { backgroundColor: 'transparent' }]}>
            <Text style={styles.username}>@anon</Text>
            <Text style={styles.subheader}>
              {artworks.length}{' '}
              {artworks.length === 1 ? 'upload' : 'uploads'}
            </Text>
          </View>
          <View style={[styles.tabBar, { backgroundColor: 'transparent' }]}>
            {(['uploads','badges','todo'] as const).map((k) => (
              <TabNote
                key={k}
                tabKey={k}
                active={activeTab === k}
                onPress={() => { setActiveTab(k); setShowSuggestions(false); }}
              />
            ))}
          </View>
        </WhiteboardHeader>
       
        </View>
        {/* Main content */}
        <SafeAreaView style={{ flex: 1, backgroundColor: 'black' }}>
            <ImageBackground
              source={require('@/assets/images/profile-bg.png')}
              style={{ flex: 1 }}
              imageStyle={{ resizeMode: 'cover',opacity:0 }}
            >
          {activeTab === 'uploads' ? (
              renderUploadsTab()
          ) : activeTab === 'badges' ? (
            <View style={styles.placeholder}>
              <Text>Badges coming soon!</Text>
            </View>
          ) : (
            renderToDoTab()
          )}
          </ImageBackground>
        </SafeAreaView>
      </View>
    );
}

/* ────────────────────────────────────────────────────────────── */
/*  Styles                                                       */
/* ────────────────────────────────────────────────────────────── */
const styles = StyleSheet.create({
  /* Filter */
  filterContainer: {
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent:'center',
    width:'100%',
    marginBottom: 12,
    marginLeft:30,
    marginTop:15,
    position: 'relative',
    margin: 10,
    zIndex: 1,
  },
  filterInput: {
    width: '66%',
    height: 30,
    marginRight: 20,
    alignSelf: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.8)',  // a slight white overlay so text is legible
    borderRadius: 6,
    paddingHorizontal: 8,
    fontSize: 16,
    color: '#333',
  },
  suggestionsList: {
    position: 'absolute',
    top: '80%',
    left: 20,
    right: 0,
    width: '85%',
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
  sectionContainer: { marginBottom: 0 },
  sectionHeader: { fontSize: 18, fontWeight: '600', marginLeft: 0, marginBottom: 0 },

  /* Header & Tabs */
  header: { alignItems: 'center', marginTop: 20, marginBottom: 12 },
  username: { fontSize: 24, fontWeight: 'bold' },
  subheader: { fontSize: 16, marginTop: 4 },
  tabBar: { 
    flexDirection: 'row',
     borderBottomWidth: 0,
      borderColor: '#e5e5e5',
      justifyContent: 'center'
     },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent'
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
    paddingHorizontal: 0,
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
    //height: 0,
  },
  filterPlank: {
    width: '95%',             // or full width minus margins
    height: 60,
    alignSelf: 'center',
    justifyContent: 'center',
    shadowOpacity: .8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    transform: [{ rotate: '-.5deg' }],
    
  },
  corkContainer: {
    // shadow for iOS
    elevation: 6,
    // make sure it sits above the content below
    zIndex: 1,
  },
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  inputRow: { flexDirection: 'row', marginBottom: 12, marginTop: 15,paddingHorizontal: 25 },
  taskinput:    { flex: 1, borderWidth: 0, borderColor: '#ccc', borderRadius: 8, padding: 8,fontStyle: 'italic' ,fontSize:20},
  taskRow:  { flexDirection: 'row', justifyContent:'space-between', paddingVertical: 8, paddingHorizontal: 15,paddingRight:30 },

  taskText: { fontSize: 20 ,fontFamily: 'Caveat',textAlignVertical: 'center',},
  taskDone: { fontSize: 20,fontStyle: 'italic',textDecorationLine: 'line-through', color: '#888' },
  delete:   { fontSize: 15, color: '#c66' },
  addButton: {
    marginLeft: 8,
    borderRadius: 18,
    width:36,
    height: 36,      // circular
    backgroundColor: '#5a3c1f', // match your crafting palette
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    fontSize: 24,          // bigger “+”
    lineHeight: 24,
    color: 'white',
  },
  taskTitleContainer: {
    flex: 1,
    marginHorizontal: 8,
    marginBottom:8,
    textAlignVertical: 'center',
  },
  taskInput: {
    flex: 1,
    fontFamily: 'Caveat',
    marginHorizontal: 8,
    borderColor: '#666',
    textAlignVertical: 'center',
  },
  cardRow: {
    justifyContent:'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
});