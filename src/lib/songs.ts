
import { getFirestore, collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { app } from '@/lib/firebase';

const db = getFirestore(app);

export type Song = {
  id: string;
  slug: string;
  title: string;
  artist: string;
  lyrics: string;
};

// This function now fetches songs from the Firestore database.
export async function getSongs(): Promise<Song[]> {
  try {
    const songsCollection = collection(db, 'songs');
    const songSnapshot = await getDocs(songsCollection);
    const songsList = songSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Song));
    return songsList;
  } catch (error) {
    console.error("Error fetching songs from Firestore: ", error);
    return []; // Return an empty array in case of an error
  }
}

// This function now fetches a single song by its ID from Firestore.
export async function getSongById(id: string): Promise<Song | undefined> {
    try {
        const songDocRef = doc(db, 'songs', id);
        const songSnap = await getDoc(songDocRef);

        if (!songSnap.exists()) {
            return undefined;
        }

        return { id: songSnap.id, ...songSnap.data() } as Song;

    } catch (error) {
        console.error("Error fetching song by ID from Firestore: ", error);
        return undefined;
    }
}


// This function now fetches a single song by its slug from Firestore.
export async function getSongBySlug(slug: string): Promise<Song | undefined> {
  try {
    const songsCollection = collection(db, 'songs');
    const q = query(songsCollection, where("slug", "==", slug));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return undefined;
    }
    
    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() } as Song;
  } catch (error) {
    console.error("Error fetching song by slug from Firestore: ", error);
    return undefined;
  }
}

export async function findSongsByTitle(titles: string[]): Promise<Song[]> {
    if (titles.length === 0) {
        return [];
    }
  try {
    const lowercasedTitles = titles.map(t => t.toLowerCase());
    const songsCollection = collection(db, 'songs');
    // Firestore 'in' query is limited to 30 elements. If more are needed, multiple queries would be required.
    const q = query(songsCollection, where("title", "in", lowercasedTitles.map(t => t.charAt(0).toUpperCase() + t.slice(1))));
    const querySnapshot = await getDocs(q);

    const songs = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Song));

    // Manual filtering for case-insensitivity as Firestore's `in` is case-sensitive.
    return songs.filter(song => lowercasedTitles.includes(song.title.toLowerCase()));

  } catch (error) {
     console.error("Error finding songs by title from Firestore: ", error);
     return [];
  }
}
