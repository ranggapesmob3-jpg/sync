
import { artistData } from './data';

interface Playlist {
  id: number;
  title: string;
  songs: string[];
}

export const playlists: Playlist[] = [];

export function addSongToPlaylist(title: string, song: string, forceAdd: boolean = false) {
  const existingPlaylist = playlists.find(
    (p) => p.title.toLowerCase() === title.toLowerCase()
  );

  if (existingPlaylist) {
    const isDuplicate = existingPlaylist.songs.includes(song);

    if (isDuplicate && !forceAdd) {
      return {
        success: true,
        isNew: false,
        isDuplicate: true
      };
    }

    existingPlaylist.songs.push(song);

    return {
      success: true,
      isNew: false,
      isDuplicate: false
    };
  } else {
    const newPlaylist: Playlist = {
      id: Date.now(),
      title: title,
      songs: [song],
    };

    playlists.push(newPlaylist);

    return {
      success: true,
      isNew: true,
      isDuplicate: false
    };
  }
}

export function removeSongFromPlaylist(playlistId: number, song: string) {
  const playlist = playlists.find(p => p.id === playlistId);

  if (playlist) {
    const index = playlist.songs.indexOf(song);

    if (index !== -1) {
      playlist.songs.splice(index, 1);
      return { success: true };
    }
  }

  return { success: false };
}

export function generatePlaylist(song: string) {
  const lower = song.toLowerCase();

  for (const artist in artistData) {
    const found = artistData[artist].recommendations.find(
      (r: { title: string; artist: string }) => r.title.toLowerCase() === lower
    );

    if (found) {
      return {
        baseSong: song,
        genre: artistData[artist].genre,
        recommendations: artistData[artist].recommendations
      };
    }
  }

  return { error: "Song not found" };
}

